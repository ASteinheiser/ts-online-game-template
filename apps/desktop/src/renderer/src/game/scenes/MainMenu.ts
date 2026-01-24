import { Scene, Scenes } from 'phaser';
import type { AuthPayload } from '@repo/core-game';
import { EventBus, EVENT_BUS } from '../EventBus';
import { CustomText } from '../objects/CustomText';
import { ASSET, SCENE } from '../constants';

export class MainMenu extends Scene {
  constructor() {
    super(SCENE.MAIN_MENU);
  }

  create() {
    const bg = this.add.image(0, 0, ASSET.BACKGROUND).setOrigin(0.5);

    const titleText = new CustomText(this, 0, 0, 'Duck, Duck, Punch', {
      fontFamily: 'Tiny5',
      fontSize: 52,
      strokeThickness: 8,
    })
      .setOrigin(0.5)
      .fadeIn(1000);

    const startButton = new CustomText(this, 0, 0, 'Click here to start', {
      fontFamily: 'Tiny5',
      fontSize: 38,
      strokeThickness: 8,
    })
      .setOrigin(0.5)
      .makeButton('#ff00ff', () => {
        EventBus.emit(EVENT_BUS.GAME_START);
      })
      .fadeIn(1000);

    const profileButton = new CustomText(this, 0, 0, 'Profile', {
      fontFamily: 'Tiny5',
      fontSize: 38,
      strokeThickness: 8,
    })
      .setOrigin(0.5)
      .makeButton('#ff00ff', () => {
        EventBus.emit(EVENT_BUS.PROFILE_OPEN);
      })
      .fadeIn(1000);

    const settingsButton = new CustomText(this, 0, 0, 'Settings', {
      fontFamily: 'Tiny5',
      fontSize: 38,
      strokeThickness: 8,
    })
      .setOrigin(0.5)
      .makeButton('#ff00ff', () => {
        EventBus.emit(EVENT_BUS.SETTINGS_OPEN);
      })
      .fadeIn(1000);

    const layout = () => {
      const { width, height } = this.scale;
      bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);

      titleText.setPosition(width / 2, height / 2 - 100);
      titleText.bounce(5, 2000);

      startButton.setPosition(width / 2, height / 2);
      profileButton.setPosition(width / 2, height / 2 + 100);
      settingsButton.setPosition(width / 2, height / 2 + 200);
    };

    layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, layout);
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, layout);
    });

    EventBus.emit(EVENT_BUS.CURRENT_SCENE_READY, this);
  }

  startGame({ token }: AuthPayload) {
    this.scene.start(SCENE.GAME, { token });
  }
}
