import { Loader, Scene, Scenes } from 'phaser';
import { PLAYER_FRAME_RATE, PLAYER_SIZE, ENEMY_SIZE } from '@repo/core-game';
import enemy from '../../assets/evil-dude.png';
import player from '../../assets/muscle-duck-sprite.png';
import punch from '../../assets/punch.mp3';
import enemyHit from '../../assets/wilhelm-scream.mp3';
import { PLAYER_ANIM } from '../objects/Player';
import { ASSET, SCENE, SOUND } from '../constants';

const PROGRESS_BAR_WIDTH = 468;
const PROGRESS_BAR_HEIGHT = 32;
const PROGRESS_BAR_PADDING = 4;

export class Preloader extends Scene {
  constructor() {
    super(SCENE.PRELOADER);
  }

  init() {
    // We loaded this image in our Boot Scene, so we can display it here
    const bg = this.add.image(0, 0, ASSET.BACKGROUND).setOrigin(0.5);

    // create a progress bar container with two rectangle components
    const progressFill = this.add.rectangle(0, 0, 0, PROGRESS_BAR_HEIGHT - PROGRESS_BAR_PADDING, 0xffffff);
    const progressOutline = this.add
      .rectangle((PROGRESS_BAR_WIDTH - PROGRESS_BAR_PADDING) / 2, 0, PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT)
      .setStrokeStyle(1, 0xffffff);
    const progress = this.add.container(0, 0, [progressOutline, progressFill]);

    const layout = () => {
      const { width, height } = this.scale;
      bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);
      progress.setPosition(width / 2 - PROGRESS_BAR_WIDTH / 2, height / 2 - PROGRESS_BAR_HEIGHT / 2);
    };

    layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, layout);
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, layout);
    });

    this.load.on(Loader.Events.PROGRESS, (progress: number) => {
      progressFill.width = (PROGRESS_BAR_WIDTH - PROGRESS_BAR_PADDING) * progress;
    });
  }

  preload() {
    this.load.spritesheet(ASSET.ENEMY, enemy, {
      frameWidth: ENEMY_SIZE.width,
      frameHeight: ENEMY_SIZE.height,
    });
    this.load.spritesheet(ASSET.PLAYER, player, {
      frameWidth: PLAYER_SIZE.width,
      frameHeight: PLAYER_SIZE.height,
    });
    this.load.audio(SOUND.PUNCH, punch);
    this.load.audio(SOUND.ENEMY_HIT, enemyHit);
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    this.anims.create({
      key: PLAYER_ANIM.IDLE,
      frames: this.anims.generateFrameNumbers(ASSET.PLAYER, { frames: [0] }),
      frameRate: PLAYER_FRAME_RATE,
      repeat: 0,
    });
    this.anims.create({
      key: PLAYER_ANIM.WALK,
      frames: this.anims.generateFrameNumbers(ASSET.PLAYER, { frames: [2, 3, 4, 1] }),
      frameRate: PLAYER_FRAME_RATE,
      repeat: -1,
    });
    // total animation length is 0.625s (5 frames at 8fps)
    // actual punch frame is 0.375s after start of animation (frame 3 / 5)
    this.anims.create({
      key: PLAYER_ANIM.PUNCH,
      frames: this.anims.generateFrameNumbers(ASSET.PLAYER, { frames: [5, 6, 7, 8, 5] }),
      frameRate: PLAYER_FRAME_RATE,
      repeat: 0,
    });

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start(SCENE.MAIN_MENU);
  }
}
