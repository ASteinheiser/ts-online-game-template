import { ServerError, CloseCode, type AuthContext, type Client } from '@colyseus/core';
import {
  WS_CODE,
  INACTIVITY_TIMEOUT,
  RECONNECTION_TIMEOUT,
  WS_EVENT,
  Player,
  type AuthPayload,
} from '@repo/core-game';
import { logger } from '../../../logger';
import type { Profile } from '../../../repo/prisma-client/client';
import { validateJwt } from '../../../auth/jwt';
import { ROOM_ERROR } from '../../error';
import type { GameRoom } from '../index';

export interface AuthResult {
  user: Profile;
  tokenExpiresAt: number;
}

export class Auth {
  private reconnectionTimeout = RECONNECTION_TIMEOUT;
  private expectingReconnections = new Set<string>();
  private forcedDisconnects = new Set<string>();

  constructor(private room: GameRoom) {}

  public cleanupPlayer(sessionId: string) {
    this.forcedDisconnects.delete(sessionId);
    this.expectingReconnections.delete(sessionId);
  }

  /**
   * Validates the user's token and fetches their profile from the DB
   *
   * Errors in onAuth will not allow reconnection
   */
  public async onAuth(context: AuthContext): Promise<AuthResult> {
    const authUser = validateJwt(context.token);
    if (!authUser) throw new ServerError(WS_CODE.UNAUTHORIZED, ROOM_ERROR.INVALID_TOKEN);

    const dbUser = await this.room.prisma?.profile.findUnique({
      where: { userId: authUser.id },
    });
    if (!dbUser) throw new ServerError(WS_CODE.NOT_FOUND, ROOM_ERROR.PROFILE_NOT_FOUND);

    return {
      user: dbUser,
      tokenExpiresAt: authUser.expiresAt,
    };
  }

  /**
   * Ensures one client per account in the room (cleans up extra connections)
   *
   * Returns the player with updated auth fields, and whether or not it was an existing player
   */
  public onJoin(client: Client, { user, tokenExpiresAt }: AuthResult) {
    let existingSessionId: string | undefined;
    let existingPlayer: Player | undefined;

    this.room.state.players.forEach((player, sessionId) => {
      if (player.userId === user.userId) {
        existingSessionId = sessionId;
        existingPlayer = player;
      }
    });

    if (existingSessionId) {
      logger.info({
        message: `Replacing existing connection`,
        data: {
          roomId: this.room.roomId,
          existingClientId: existingSessionId,
          newClientId: client.sessionId,
          userName: user.userName,
        },
      });

      const existingClient = this.room.clients.getById(existingSessionId);
      if (existingClient) {
        // do not allow reconnection, this client/player should be forcefully removed
        this.kickClient(WS_CODE.FORBIDDEN, ROOM_ERROR.NEW_CONNECTION_FOUND, existingClient, false);
      } else {
        // this is a very odd state, just cleanup/respawn the player
        this.room.cleanupPlayer(existingSessionId);
      }
    }

    const player = existingPlayer ?? new Player();

    player.userId = user.userId;
    player.username = user.userName;
    player.tokenExpiresAt = tokenExpiresAt;
    player.lastActivityTime = Date.now();

    return {
      player,
      isExistingPlayer: !!existingPlayer,
    };
  }

  /** Disconnect a client (allowing reconnection by default) */
  public kickClient(code: number, message: string, client: Client, allowReconnection = true) {
    logger.info({
      message: `Disconnecting client...`,
      data: { roomId: this.room.roomId, clientId: client.sessionId, allowReconnection, code, message },
    });

    if (!allowReconnection) {
      this.forcedDisconnects.add(client.sessionId);
    }
    client.leave(code, message);
  }

  /** Handles all clients leaving the room (including reconnection) */
  public async onLeave(client: Client, code: number) {
    const { sessionId } = client;
    const consented = code === CloseCode.CONSENTED;

    logger.info({
      message: `Client left...`,
      data: { roomId: this.room.roomId, clientId: sessionId, consented },
    });

    if (consented || this.forcedDisconnects.has(sessionId)) {
      return this.room.cleanupPlayer(sessionId);
    }

    try {
      logger.info({
        message: `Attempting to reconnect client`,
        data: { roomId: this.room.roomId, clientId: sessionId },
      });

      this.expectingReconnections.add(sessionId);
      await this.room.allowReconnection(client, this.reconnectionTimeout);
      this.expectingReconnections.delete(sessionId);

      const player = this.room.state.players.get(sessionId);
      if (!player) {
        // do not allow reconnection, client will need to re-join
        return this.kickClient(WS_CODE.FORBIDDEN, ROOM_ERROR.CONNECTION_NOT_FOUND, client, false);
      }
      // players should have inputs cleared on reconnection
      player.inputQueue = [];
      player.lastActivityTime = Date.now();

      logger.info({
        message: `Client reconnected`,
        data: { roomId: this.room.roomId, clientId: sessionId },
      });
    } catch {
      logger.info({
        message: `Client failed to reconnect in time`,
        data: { roomId: this.room.roomId, clientId: sessionId },
      });

      this.room.cleanupPlayer(sessionId);
    }
  }

  /** errors in refreshToken event should not allow reconnection, clients will need to re-authenticate when re-joining */
  public setupRefreshTokenHandler() {
    this.room.onMessage(WS_EVENT.REFRESH_TOKEN, (client, payload: AuthPayload) => {
      const authUser = validateJwt(payload.token);
      if (!authUser) {
        return this.kickClient(WS_CODE.UNAUTHORIZED, ROOM_ERROR.INVALID_TOKEN, client, false);
      }

      const player = this.room.state.players.get(client.sessionId);
      if (!player) {
        return this.kickClient(WS_CODE.NOT_FOUND, ROOM_ERROR.CONNECTION_NOT_FOUND, client, false);
      }

      const hasUserIdChanged = player.userId !== authUser.id;
      if (hasUserIdChanged) {
        return this.kickClient(WS_CODE.FORBIDDEN, ROOM_ERROR.USER_ID_CHANGED, client, false);
      }

      player.lastActivityTime = Date.now();
      player.tokenExpiresAt = authUser.expiresAt;

      logger.info({
        message: `Token refreshed`,
        data: { roomId: this.room.roomId, clientId: client.sessionId, userName: player.username },
      });
    });
  }

  public startConnectionCheck(connectionCheckInterval: number) {
    this.room.clock.setInterval(() => this.checkPlayerConnection(), connectionCheckInterval);
  }

  private checkPlayerConnection() {
    const clientsToRemove: Array<{ client: Client; reason: string }> = [];

    this.room.state.players.forEach((player, sessionId) => {
      const client = this.room.clients.getById(sessionId);
      if (!client) {
        // Skip removal if we're still waiting for this client to reconnect
        if (this.expectingReconnections.has(sessionId)) return;

        this.room.cleanupPlayer(sessionId);
        return;
      }

      const tokenExpiresIn = player.tokenExpiresAt - Date.now();
      if (tokenExpiresIn <= 0) {
        clientsToRemove.push({ client, reason: ROOM_ERROR.TOKEN_EXPIRED });
        return;
      }

      const timeSinceLastActivity = Date.now() - player.lastActivityTime;
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        clientsToRemove.push({ client, reason: ROOM_ERROR.PLAYER_INACTIVITY });
        return;
      }
    });

    clientsToRemove.forEach(({ client, reason }) => {
      logger.info({
        message: `Removing client...`,
        data: { roomId: this.room.roomId, clientId: client.sessionId, reason },
      });

      if (reason === ROOM_ERROR.TOKEN_EXPIRED) {
        // do not allow reconnection, client will need to re-authenticate
        this.kickClient(WS_CODE.UNAUTHORIZED, reason, client, false);
      } else {
        this.kickClient(WS_CODE.TIMEOUT, reason, client);
      }
    });
  }
}
