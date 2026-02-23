import { Client, getStateCallbacks, type Room } from '@colyseus/sdk';
import {
  WS_EVENT,
  WS_ROOM,
  WS_CODE,
  type AuthPayload,
  type GameRoomState,
  type Player as ServerPlayer,
  type Enemy as ServerEnemy,
} from '@repo/core-game';
import { EventBus, EVENT_BUS } from '../EventBus';
import type { Game } from '../scenes/Game';

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
if (!WEBSOCKET_URL) throw new Error('VITE_WEBSOCKET_URL is not set');

/** Used to configure Colyseus automatic reconnection (new to 0.17) */
const AUTO_RECONNECT_MAX_ATTEMPTS = 8;
/** Used for custom reconnection logic */
const RECONNECTION_STORAGE_KEY = 'game_reconnection_token';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BACKOFF_MS = 1000;
/** The timeout for the connection to be considered alive (in ms) */
const CONNECTION_IS_ALIVE_TIMEOUT = 5000;

type ServerCallback = ReturnType<typeof getStateCallbacks<GameRoomState>>;
export interface RoomEventCallbacks {
  setupStateListeners: () => void;
  onPlayerAdded: (player: ServerPlayer, sessionId: string, $: ServerCallback) => void;
  onPlayerRemoved: (sessionId: string) => void;
  onEnemyAdded: (enemy: ServerEnemy, $: ServerCallback) => void;
  onEnemyRemoved: (enemy: ServerEnemy) => void;
}

export class RoomSystem {
  public room?: Room<GameRoomState>;
  private client = new Client(WEBSOCKET_URL);
  private reconnectionAttempt = 0;

  constructor(private scene: Game) {}

  public cleanupRoom() {
    this.room?.removeAllListeners();
    delete this.room;
  }

  public async joinRoom(authToken: string) {
    this.client.auth.token = authToken;

    const reconnectToken = this.getStoredReconnectionToken();
    if (reconnectToken) {
      try {
        this.room = await this.client.reconnect<GameRoomState>(reconnectToken);
        EventBus.emit(EVENT_BUS.TOAST_SUCCESS, 'Reconnection successful!');
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
    // store the reconnection token for future reconnection
    if (this.room) {
      this.storeReconnectionToken(this.room.reconnectionToken);
    }
  }

  public refreshToken({ token }: AuthPayload) {
    if (token === this.client.auth.token) return;

    try {
      this.client.auth.token = token;
      this.room?.send(WS_EVENT.REFRESH_TOKEN, { token });
    } catch (error) {
      console.error('Failed to refresh token: ', error);
    }
  }

  public async isConnectionAlive(): Promise<boolean> {
    const room = this.room;
    if (!room) return false;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), CONNECTION_IS_ALIVE_TIMEOUT);
      const unsubscribe = room.onMessage(WS_EVENT.PONG, () => {
        clearTimeout(timeout);
        unsubscribe(); // remove one-time listener
        resolve(true);
      });
      room.send(WS_EVENT.PING);
    });
  }

  public setupRoomEventListeners(callbacks: RoomEventCallbacks) {
    if (!this.room) return;

    this.reconnectionAttempt = 0;
    this.room.reconnection.maxRetries = AUTO_RECONNECT_MAX_ATTEMPTS;

    this.room.onError((code, message) => {
      let errorMessage = 'Unexpected error with room connection';
      if (code || message) {
        errorMessage = `Room error: ${code} - ${message}`;
      }
      EventBus.emit(EVENT_BUS.TOAST_ERROR, errorMessage);
    });

    this.room.onDrop(() => {
      this.reconnectionAttempt++;
      EventBus.emit(EVENT_BUS.TOAST_INFO, `Reconnecting... (${this.reconnectionAttempt})`);
    });

    this.room.onReconnect(() => {
      this.reconnectionAttempt = 0;
      EventBus.emit(EVENT_BUS.TOAST_SUCCESS, 'Reconnection successful!');
    });

    this.room.onLeave(async (code) => {
      await this.handleOnLeave(code, callbacks.setupStateListeners);
    });

    const $ = getStateCallbacks(this.room);

    $(this.room.state).players.onAdd((player, sessionId) => {
      callbacks.onPlayerAdded(player, sessionId, $);
    });

    $(this.room.state).players.onRemove((_, sessionId) => {
      callbacks.onPlayerRemoved(sessionId);
    });

    $(this.room.state).enemies.onAdd((enemy) => {
      callbacks.onEnemyAdded(enemy, $);
    });

    $(this.room.state).enemies.onRemove((enemy) => {
      callbacks.onEnemyRemoved(enemy);
    });
  }

  private async handleOnLeave(code: number, setupStateListeners: () => void) {
    switch (code) {
      case WS_CODE.SUCCESS:
        this.clearStoredReconnectionToken();
        this.scene.sendToGameOver();
        break;
      case WS_CODE.INTERNAL_SERVER_ERROR:
      case WS_CODE.BAD_REQUEST:
      case WS_CODE.TIMEOUT:
        if (!(await this.handleReconnection(setupStateListeners))) {
          this.scene.sendToMainMenu('Failed to reconnect');
        }
        break;
      case WS_CODE.UNAUTHORIZED:
      case WS_CODE.FORBIDDEN:
      case WS_CODE.NOT_FOUND:
        this.clearStoredReconnectionToken();
        this.scene.sendToMainMenu('You were removed from the game');
        break;
      default:
        this.scene.sendToMainMenu('Oops, something went wrong. Please try to reconnect.');
    }
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

  private async handleReconnection(setupStateListeners: () => void) {
    const reconnectToken = this.getStoredReconnectionToken();
    if (!reconnectToken) return false;

    for (let attempt = 0; attempt < MAX_RECONNECT_ATTEMPTS; attempt++) {
      const attemptDisplay = attempt + 1;
      EventBus.emit(EVENT_BUS.TOAST_INFO, `Reconnecting... (${attemptDisplay})`);

      try {
        const newRoom = await this.client.reconnect(reconnectToken);
        // clear the old reconnection token and room listeners
        this.clearStoredReconnectionToken();
        this.cleanupRoom();
        // set the new room state and listeners
        this.room = newRoom;
        setupStateListeners();
        // store the new reconnection token for future reconnection
        this.storeReconnectionToken(newRoom.reconnectionToken);
        EventBus.emit(EVENT_BUS.TOAST_SUCCESS, 'Reconnection successful!');
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
