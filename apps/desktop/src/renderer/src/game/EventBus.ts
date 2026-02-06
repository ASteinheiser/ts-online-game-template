import { Events } from 'phaser';

/**
 * Used to emit events between React components and Phaser scenes
 * @see https://docs.phaser.io/phaser/concepts/events
 */
export const EventBus = new Events.EventEmitter();

export const EVENT_BUS = {
  CURRENT_SCENE_READY: 'current-scene-ready',
  GAME_START: 'game-start',
  JOIN_ERROR: 'join-error',
  PROFILE_OPEN: 'menu-open__profile',
  SETTINGS_OPEN: 'menu-open__settings',
  COIN_OPEN: 'coin-open',
  RECONNECTION_ATTEMPT: 'reconnection-attempt',
  RECONNECTION_SUCCESS: 'reconnection-success',
} as const;
