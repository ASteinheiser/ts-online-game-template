import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { GAME_CONTAINER_ID } from './constants';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: GAME_CONTAINER_ID,
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

export const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};
