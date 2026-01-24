import { Scene, Scenes } from 'phaser';
import { EventBus, EVENT_BUS } from '../EventBus';
import { CustomText } from '../objects/CustomText';
import { ASSET, SCENE } from '../constants';

export class GameOver extends Scene {
  cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super(SCENE.GAME_OVER);
  }

  preload() {
    this.cursorKeys = this.input.keyboard?.createCursorKeys();
  }

  create({
    gameResults,
  }: {
    gameResults: Array<{ username: string; attackCount: number; killCount: number }>;
  }) {
    this.cameras.main.setBackgroundColor(0xff0000);

    const bg = this.add.image(0, 0, ASSET.BACKGROUND).setAlpha(0.5).setOrigin(0.5);

    const titleText = new CustomText(this, 0, 0, 'Game Over', {
      fontFamily: 'Tiny5',
      fontSize: 64,
      strokeThickness: 8,
    })
      .setOrigin(0.5)
      .typeWriter(150);

    const continueText = new CustomText(this, 0, 0, 'Press Shift to continue', {
      fontFamily: 'Tiny5',
      fontSize: 20,
    }).fadeIn(1500);

    const resultTexts: CustomText[] = [];
    gameResults.forEach((result, index) => {
      const accuracy = ((result.killCount / result.attackCount || 0) * 100).toFixed(2);
      const killCountText = `${result.killCount} kill${result.killCount === 1 ? '' : 's'}`;

      const resultText = `${result.username} - ${killCountText} (${accuracy}% accuracy)`;

      const text = new CustomText(this, 0, 0, resultText, { fontFamily: 'Iceberg' })
        .setOrigin(0.5)
        .fadeIn(500, 300 * (index + 1));

      resultTexts.push(text);
    });

    const layout = () => {
      const { width, height } = this.scale;
      bg.setPosition(width / 2, height / 2).setDisplaySize(width, height);

      continueText.setPosition((width - continueText.width) / 2, 20);

      titleText.setPosition(width / 2, height / 2 - 100);

      resultTexts.forEach((text, idx) => {
        text.setPosition(width / 2, height / 2 + idx * 40);
      });
    };

    layout();
    this.scale.on(Phaser.Scale.Events.RESIZE, layout);
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, layout);
    });

    EventBus.emit(EVENT_BUS.CURRENT_SCENE_READY, this);
  }

  update() {
    if (this.cursorKeys?.shift.isDown) {
      this.changeScene();
    }
  }

  changeScene() {
    this.scene.start(SCENE.MAIN_MENU);
  }
}
