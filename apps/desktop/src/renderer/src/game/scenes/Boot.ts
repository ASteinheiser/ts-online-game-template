import { Scene } from 'phaser';
import background from '../../assets/bg.png';
import { ASSET, SCENE } from '../constants';

export class Boot extends Scene {
  constructor() {
    super(SCENE.BOOT);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

    this.load.image(ASSET.BACKGROUND, background);
  }

  create() {
    const bg = this.add.image(0, 0, ASSET.BACKGROUND).setAlpha(0.5).setOrigin(0.5);

    const centerBackground = () => {
      const { width, height } = this.scale;
      bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    };

    centerBackground();
    this.scale.on('resize', centerBackground);

    this.scene.start(SCENE.PRELOADER);
  }
}
