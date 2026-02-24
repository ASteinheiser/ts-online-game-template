import { Room, type AuthContext, type Client } from '@colyseus/core';
import { GameRoomState, FIXED_TIME_STEP, WS_EVENT, WS_CODE } from '@repo/core-game';
import type { PrismaClient } from '../../repo/prisma-client/client';
import { logger } from '../../logger';
import { ROOM_ERROR } from '../error';
import { Auth, type AuthResult } from './systems/Auth';
import { Enemies } from './systems/Enemies';
import { PlayerInput } from './systems/PlayerInput';
import { PlayerMovement } from './systems/PlayerMovement';
import { PlayerCombat } from './systems/PlayerCombat';

const MAX_PLAYERS_PER_ROOM = 10;
/** This is the speed at which we stream updates to the client.
 * Updates should be interpolated clientside to appear smoother */
const SERVER_PATCH_RATE = 1000 / 20; // 20fps = 50ms

/** Basic in-memory storage of results for all players in a room */
export const RESULTS: ResultStorage = {};
interface ResultStorage {
  [roomId: string]: {
    [userId: string]: {
      username: string;
      attackCount: number;
      killCount: number;
    };
  };
}

interface GameRoomArgs {
  prisma: PrismaClient;
  connectionCheckInterval: number;
}

export class GameRoom extends Room {
  readonly patchRate = SERVER_PATCH_RATE;
  readonly maxClients = MAX_PLAYERS_PER_ROOM;

  public prisma?: PrismaClient;
  public auth = new Auth(this);

  private elapsedTime = 0;
  public state = new GameRoomState();
  private enemies = new Enemies(this);
  private playerInput = new PlayerInput(this);
  private playerMovement = new PlayerMovement(this);
  private playerCombat = new PlayerCombat(this);

  onCreate({ prisma, connectionCheckInterval }: GameRoomArgs) {
    logger.info({
      message: `New room created!`,
      data: { roomId: this.roomId },
    });

    this.prisma = prisma;

    this.auth.setupRefreshTokenHandler();
    this.auth.startConnectionCheck(connectionCheckInterval);

    // Ping/Pong for client RTT measurement
    this.onMessage(WS_EVENT.PING, (client) => {
      client.send(WS_EVENT.PONG);
    });

    this.onMessage(WS_EVENT.LEAVE_ROOM, (client) => {
      // we explicitly do not want to allow reconnection here
      this.auth.kickClient(WS_CODE.SUCCESS, 'Intentional leave', client, false);
    });

    this.playerInput.setupPlayerInputHandler();

    this.setSimulationInterval((deltaTime) => {
      this.elapsedTime += deltaTime;

      while (this.elapsedTime >= FIXED_TIME_STEP) {
        this.elapsedTime -= FIXED_TIME_STEP;
        this.fixedTick();
      }
    }, this.patchRate);
  }

  onAuth(_: Client, __: unknown, context: AuthContext) {
    return this.auth.onAuth(context);
  }

  onJoin(client: Client, _: unknown, authResult: AuthResult) {
    const { player, isExistingPlayer } = this.auth.onJoin(client, authResult);

    this.playerMovement.spawnPlayer(client.sessionId, player, isExistingPlayer);
  }

  onLeave(client: Client, code: number) {
    return this.auth.onLeave(client, code);
  }

  cleanupPlayer(sessionId: string) {
    logger.info({
      message: `Cleaning up player...`,
      data: { roomId: this.roomId, clientId: sessionId },
    });

    this.state.players.delete(sessionId);
    this.auth.cleanupPlayer(sessionId);
  }

  onDispose() {
    logger.info({
      message: `Room disposing...`,
      data: { roomId: this.roomId },
    });

    // delete results after 10 seconds -- stop gap for in-memory management
    setTimeout(() => delete RESULTS[this.roomId], 10 * 1000);

    // handle room closing logic, such as saving state, etc.
  }

  onUncaughtException(error: Error, methodName: string) {
    // log any uncaught errors for debugging purposes
    logger.error({
      message: `Uncaught exception`,
      data: { roomId: this.roomId, methodName, error: error.message },
    });

    // possibly handle saving game state
    // possibly handle disconnecting all clients if needed
  }

  fixedTick() {
    this.state.players.forEach((player, sessionId) => {
      const client = this.clients.getById(sessionId);
      // only process players that are still connected
      if (!client) return;

      try {
        this.playerInput.processPlayerInput(player, (input) => {
          this.playerMovement.handleInput(player, input);
          this.playerCombat.handleInput(player, input);
        });
      } catch (error) {
        const message = (error as Error)?.message || ROOM_ERROR.INTERNAL_SERVER_ERROR;
        // allow reconnection as player inputs will be cleared, potentially solving issues
        this.auth.kickClient(WS_CODE.INTERNAL_SERVER_ERROR, message, client);
      }
    });

    // spawn and move enemies
    this.enemies.spawnEnemy();
    this.enemies.moveEnemy();
  }
}
