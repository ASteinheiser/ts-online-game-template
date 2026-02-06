import { Scene, Scenes } from 'phaser';
import { Client, getStateCallbacks, type Room } from '@colyseus/sdk';
import {
  calculateMovement,
  FIXED_TIME_STEP,
  PLAYER_SIZE,
  MAP_SIZE,
  WS_ROOM,
  WS_EVENT,
  WS_CODE,
  type AuthPayload,
  type InputPayload,
} from '@repo/core-game';
import { gql } from '@apollo/client';
import { client } from '../../graphql/client';
import type { Desktop_GetGameResultsQuery, Desktop_GetGameResultsQueryVariables } from '../../graphql';
import { EventBus, EVENT_BUS } from '../EventBus';
import { Player } from '../objects/Player';
import { PunchBox } from '../objects/PunchBox';
import { Enemy } from '../objects/Enemy';
import { CustomText } from '../objects/CustomText';
import { PingDisplay } from '../objects/PingDisplay';
import { ASSET, SCENE } from '../constants';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
if (!WEBSOCKET_URL) throw new Error('VITE_WEBSOCKET_URL is not set');

const RECONNECTION_STORAGE_KEY = 'game_reconnection_token';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BACKOFF_MS = 1000;

export class Game extends Scene {
  client: Client;
  room?: Room;
  pingDisplay?: PingDisplay;
  elapsedTime = 0;

  playerEntities: Record<string, Player> = {};
  currentPlayer?: Player;
  /** This is used to track the player according to the server */
  currentPlayerServer?: Phaser.GameObjects.Rectangle;
  enemyEntities: Record<string, Enemy> = {};

  escapeKey?: Phaser.Input.Keyboard.Key;
  cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  pendingInputs: Array<InputPayload> = [];
  inputSeq = 0;
  serverAckSeq = 0;

  constructor() {
    super(SCENE.GAME);

    this.client = new Client(WEBSOCKET_URL);
  }

  preload() {
    this.escapeKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
  }

  async refreshToken({ token }: AuthPayload) {
    if (token === this.client?.auth?.token) return;

    try {
      this.client.auth.token = token;
      this.room?.send(WS_EVENT.REFRESH_TOKEN, { token });
    } catch (error) {
      console.error('Failed to refresh token: ', error);
    }
  }

  async create({ token }: AuthPayload) {
    // set the camera bounds to the map size
    this.cameras.main.setBackgroundColor(0x00ff00).setBounds(0, 0, MAP_SIZE.width, MAP_SIZE.height);

    // draw a border around the map area
    this.add
      .rectangle(0, 0, MAP_SIZE.width, MAP_SIZE.height)
      .setOrigin(0, 0)
      .setDepth(99)
      .setStrokeStyle(8, 0x990099);

    // set the background image to cover the entire map area
    this.add
      .image(0, 0, ASSET.BACKGROUND)
      .setAlpha(0.5)
      .setOrigin(0.5)
      .setPosition(MAP_SIZE.width / 2, MAP_SIZE.height / 2)
      .setDisplaySize(MAP_SIZE.width, MAP_SIZE.height);

    const leaveText = new CustomText(this, 0, 0, 'Press Shift to leave the game', {
      fontFamily: 'Tiny5',
      fontSize: 20,
    }).setScrollFactor(0);

    const layout = () => {
      const { width } = this.scale;
      leaveText.setPosition((width - leaveText.width) / 2, 20);
    };

    layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, layout);
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, layout);
    });

    this.client.auth.token = token;

    const reconnectToken = this.getStoredReconnectionToken();
    if (reconnectToken) {
      try {
        this.room = await this.client.reconnect(reconnectToken);
      } catch (reconnectError) {
        console.warn('Reconnection failed, falling back to joinOrCreate:', reconnectError);
      }
    }
    try {
      if (!this.room) {
        this.room = await this.client.joinOrCreate(WS_ROOM.GAME_ROOM);
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
    if (!this.room) {
      this.sendToMainMenu(new Error('Failed to join room'));
      return;
    }
    // store the reconnection token for future reconnection
    this.storeReconnectionToken(this.room.reconnectionToken);

    this.setupRoomEventListeners();

    EventBus.emit(EVENT_BUS.CURRENT_SCENE_READY, this);
  }

  setupRoomEventListeners() {
    if (!this.room) return;
    // cleanup any old entities
    this.cleanup();

    this.pingDisplay = new PingDisplay(this);
    this.pingDisplay.start(this.room);

    this.room.onError((code, message) => {
      const errorMessage = `Room error: ${code} - ${message}`;
      console.error(errorMessage);

      this.sendToMainMenu(new Error(errorMessage));
    });

    this.room.onLeave(async (code) => {
      switch (code) {
        case WS_CODE.SUCCESS:
          await this.sendToGameOver();
          break;
        case WS_CODE.INTERNAL_SERVER_ERROR:
        case WS_CODE.BAD_REQUEST:
        case WS_CODE.TIMEOUT:
          if (!(await this.handleReconnection())) {
            this.sendToMainMenu(new Error('Failed to reconnect'));
          }
          break;
        case WS_CODE.UNAUTHORIZED:
        case WS_CODE.FORBIDDEN:
        case WS_CODE.NOT_FOUND:
          this.clearStoredReconnectionToken();
          this.sendToMainMenu(new Error('You were removed from the game'));
          break;
        default:
          this.sendToMainMenu(new Error(`Oops, something went wrong. Please try to reconnect.`));
      }
    });

    const $ = getStateCallbacks(this.room);

    $(this.room.state).players.onAdd((player, sessionId) => {
      const entity = this.physics.add.sprite(player.x, player.y, ASSET.PLAYER).setDepth(100);

      const nameText = new CustomText(this, player.x, player.y, player.username, {
        fontFamily: 'Tiny5',
        fontSize: 12,
      }).setOrigin(0.5, 2.75);

      const newPlayer = new Player(this, entity, nameText);

      this.playerEntities[sessionId] = newPlayer;

      // keep track of the current player
      if (sessionId === this.room?.sessionId) {
        this.currentPlayer = newPlayer;
        // ensure the camera is following the current player
        this.cameras.main.startFollow(entity, true, 0.1, 0.1);

        // #region FOR DEBUGGING PURPOSES
        this.currentPlayerServer = this.add.rectangle(0, 0, entity.width, entity.height).setDepth(100);
        this.currentPlayerServer.setStrokeStyle(1, 0xff0000);
        // #endregion FOR DEBUGGING PURPOSES

        $(player).onChange(() => {
          // #region FOR DEBUGGING PURPOSES
          if (this.currentPlayerServer) {
            this.currentPlayerServer.x = player.x;
            this.currentPlayerServer.y = player.y;

            if (player.attackDamageFrameX !== undefined && player.attackDamageFrameY !== undefined) {
              new PunchBox(this, player.attackDamageFrameX, player.attackDamageFrameY, 0x0000ff);
            }
          }
          // #endregion FOR DEBUGGING PURPOSES

          if (this.currentPlayer) {
            // show a coin modal when the player kills an enemy
            if (this.currentPlayer.killCount !== player.killCount) {
              this.currentPlayer.killCount = player.killCount;
              EventBus.emit(EVENT_BUS.COIN_OPEN);
            }

            // Server-side reconciliation (ensure CSP is in sync with server authority)
            const nextServerAckSeq = player.lastProcessedInputSeq ?? 0;
            // Ignore out-of-order acks
            if (nextServerAckSeq < this.serverAckSeq) return;

            // Update ack and drop acknowledged inputs
            this.serverAckSeq = nextServerAckSeq;
            while (this.pendingInputs.length && this.pendingInputs[0].seq <= nextServerAckSeq) {
              this.pendingInputs.shift();
            }

            // Determine the target position we expect given remaining inputs
            // Start from authoritative server position
            let targetPosition = { x: player.x, y: player.y };
            for (const { left, right, up, down } of this.pendingInputs) {
              targetPosition = calculateMovement({
                x: targetPosition.x,
                y: targetPosition.y,
                ...PLAYER_SIZE,
                left,
                right,
                up,
                down,
              });
            }

            // if our CSP is out of sync with the server state, sync client state with server state
            if (
              this.currentPlayer.entity.x !== targetPosition.x ||
              this.currentPlayer.entity.y !== targetPosition.y
            ) {
              this.currentPlayer.forceMove(targetPosition);
            }
          }
        });
      } else {
        // update the other players positions from the server
        $(player).onChange(() => {
          entity.setData('serverUsername', player.username);
          entity.setData('serverX', player.x);
          entity.setData('serverY', player.y);
          entity.setData('serverAttack', player.isAttacking);

          // #region FOR DEBUGGING PURPOSES
          if (player.attackDamageFrameX !== undefined && player.attackDamageFrameY !== undefined) {
            new PunchBox(this, player.attackDamageFrameX, player.attackDamageFrameY, 0xff0000);
          }
          // #endregion FOR DEBUGGING PURPOSES
        });
      }
    });

    $(this.room.state).players.onRemove((_, sessionId) => {
      const foundPlayer = this.playerEntities[sessionId];
      if (foundPlayer) {
        foundPlayer.destroy();
        delete this.playerEntities[sessionId];
      }
    });

    $(this.room.state).enemies.onAdd((enemy) => {
      const entity = new Enemy(this, enemy.x, enemy.y);
      this.enemyEntities[enemy.id] = entity;

      $(enemy).onChange(() => {
        entity.move(
          Phaser.Math.Linear(entity.entity.x, enemy.x, 0.2),
          Phaser.Math.Linear(entity.entity.y, enemy.y, 0.2)
        );
      });
    });

    $(this.room.state).enemies.onRemove((enemy) => {
      const foundEnemy = this.enemyEntities[enemy.id];
      if (foundEnemy) {
        this.currentPlayer?.hit();
        foundEnemy.destroy();
        delete this.enemyEntities[enemy.id];
      }
    });
  }

  update(_: number, delta: number): void {
    // skip if not yet connected
    if (!this.currentPlayer) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= FIXED_TIME_STEP) {
      this.elapsedTime -= FIXED_TIME_STEP;
      this.fixedTick();
    }
  }

  fixedTick() {
    if (!this.room?.connection.isOpen || !this.currentPlayer || !this.cursorKeys || !this.escapeKey) {
      return;
    }

    // press escape to open the settings menu
    if (this.escapeKey.isDown) {
      EventBus.emit(EVENT_BUS.SETTINGS_OPEN);
    }

    // press shift to leave the game
    if (this.cursorKeys.shift.isDown) {
      this.room.send(WS_EVENT.LEAVE_ROOM);
      return;
    }

    const inputPayload: InputPayload = {
      seq: this.inputSeq++,
      left: this.cursorKeys.left.isDown,
      right: this.cursorKeys.right.isDown,
      up: this.cursorKeys.up.isDown,
      down: this.cursorKeys.down.isDown,
      attack: this.cursorKeys.space.isDown,
    };
    this.pendingInputs.push(inputPayload);
    this.room.send(WS_EVENT.PLAYER_INPUT, inputPayload);

    const { attack, left, right, up, down } = inputPayload;

    if (attack) this.currentPlayer.punch();

    const { x, y } = this.currentPlayer.entity;
    const newPosition = calculateMovement({ x, y, ...PLAYER_SIZE, left, right, up, down });
    this.currentPlayer.move(newPosition);

    for (const sessionId in this.playerEntities) {
      // skip the current player since we are handling on the client
      if (sessionId === this.room.sessionId) continue;
      // interpolate all other player entities from the server
      const serverPlayer = this.playerEntities[sessionId];
      const { serverX, serverY, serverAttack } = serverPlayer.entity.data.values;

      if (serverAttack) {
        serverPlayer.punch();
      } else {
        serverPlayer.stopPunch();
      }
      serverPlayer.move({
        x: Phaser.Math.Linear(serverPlayer.entity.x, serverX, 0.2),
        y: Phaser.Math.Linear(serverPlayer.entity.y, serverY, 0.2),
      });
    }
  }

  cleanup() {
    this.pingDisplay?.destroy();
    delete this.pingDisplay;

    this.currentPlayer?.destroy();
    delete this.currentPlayer;

    this.currentPlayerServer?.destroy();
    delete this.currentPlayerServer;

    Object.values(this.playerEntities).forEach((player) => player.destroy());
    this.playerEntities = {};

    Object.values(this.enemyEntities).forEach((enemy) => enemy.destroy());
    this.enemyEntities = {};
  }

  cleanupRoom() {
    this.room?.removeAllListeners();
    delete this.room;
  }

  sendToMainMenu(error: unknown) {
    console.error(error);
    EventBus.emit(EVENT_BUS.JOIN_ERROR, error);

    this.cleanup();
    this.cleanupRoom();
    this.scene.start(SCENE.MAIN_MENU);
  }

  async sendToGameOver() {
    const roomId = this.room?.roomId;
    if (!roomId) return;

    const gameResults = await getGameResults(roomId);

    this.cleanup();
    this.cleanupRoom();
    this.clearStoredReconnectionToken();
    this.scene.start(SCENE.GAME_OVER, { gameResults });
  }

  private storeReconnectionToken(token: string) {
    localStorage.setItem(RECONNECTION_STORAGE_KEY, token);
  }

  private getStoredReconnectionToken() {
    return localStorage.getItem(RECONNECTION_STORAGE_KEY);
  }

  private clearStoredReconnectionToken() {
    localStorage.removeItem(RECONNECTION_STORAGE_KEY);
  }

  async handleReconnection() {
    const reconnectToken = this.getStoredReconnectionToken();
    if (!reconnectToken) return false;

    for (let attempt = 0; attempt < MAX_RECONNECT_ATTEMPTS; attempt++) {
      const attemptDisplay = attempt + 1;
      EventBus.emit(EVENT_BUS.RECONNECTION_ATTEMPT, attemptDisplay);

      try {
        const newRoom = await this.client.reconnect(reconnectToken);
        // clear the old reconnection token and room listeners
        this.clearStoredReconnectionToken();
        this.cleanupRoom();
        // set the new room state and listeners
        this.room = newRoom;
        this.setupRoomEventListeners();
        // store the new reconnection token for future reconnection
        this.storeReconnectionToken(newRoom.reconnectionToken);
        return true;
      } catch (error) {
        console.warn(`Reconnection attempt ${attemptDisplay} failed:`, error);
        // exponential backoff => 1s, 2s, 4s...
        const backoffMs = RECONNECT_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
    return false;
  }
}

const getGameResults = async (roomId: string) => {
  const { data } = await client.query<Desktop_GetGameResultsQuery, Desktop_GetGameResultsQueryVariables>({
    variables: { roomId },
    fetchPolicy: 'network-only',
    query: gql`
      query Desktop_GetGameResults($roomId: String!) {
        gameResults(roomId: $roomId) {
          username
          attackCount
          killCount
        }
      }
    `,
  });

  return data?.gameResults ?? [];
};
