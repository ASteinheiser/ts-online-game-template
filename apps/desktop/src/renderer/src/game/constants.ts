export const GAME_CONTAINER_ID = 'game-container';

export const SCENE = {
  BOOT: 'boot',
  PRELOADER: 'preloader',
  MAIN_MENU: 'main_menu',
  GAME: 'game',
  GAME_OVER: 'game_over',
} as const;

export const ASSET = {
  BACKGROUND: 'background',
  ENEMY: 'enemy',
  PLAYER: 'player',
} as const;

export const SOUND = {
  PUNCH: 'punch',
  ENEMY_HIT: 'enemy_hit',
} as const;
