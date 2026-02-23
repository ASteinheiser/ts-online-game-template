import { Events } from 'phaser';

/**
 * Used to emit events between React components and Phaser scenes
 * @see https://docs.phaser.io/phaser/concepts/events
 */
export const EventBus = new Events.EventEmitter();

export const EVENT_BUS = {
  CURRENT_SCENE_READY: 'current-scene-ready',
  GAME_START: 'game-start',
  PROFILE_OPEN: 'menu-open__profile',
  SETTINGS_OPEN: 'menu-open__settings',
  COIN_OPEN: 'coin-open',
  TOAST_INFO: 'toast-info',
  TOAST_SUCCESS: 'toast-success',
  TOAST_ERROR: 'toast-error',
} as const;
