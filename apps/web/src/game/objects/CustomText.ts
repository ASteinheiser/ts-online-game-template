import { GameObjects, Scene } from 'phaser';

export class CustomText extends GameObjects.Text {
  color: string | CanvasGradient | CanvasPattern;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string | string[],
    style?: Phaser.Types.GameObjects.Text.TextStyle
  ) {
    const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    };

    const mergedStyle = { ...defaultStyle, ...style };

    super(scene, x, y, text, mergedStyle);

    this.color = mergedStyle.color as string;

    scene.add.existing(this);
  }

  bounce(height = 10, duration = 1000): this {
    this.scene.tweens.add({
      targets: this,
      y: this.y - height,
      duration: duration / 2,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    return this;
  }

  typeWriter(speed = 50): this {
    const fullText = String(this.text);
    this.text = '';

    let index = 0;
    const timer = this.scene.time.addEvent({
      delay: speed,
      callback: () => {
        this.text += fullText[index];
        index++;

        if (index >= fullText.length) {
          timer.destroy();
        }
      },
      repeat: fullText.length - 1,
    });

    return this;
  }

  makeButton(hoverColor = '#ff00ff', callback = () => {}): this {
    this.setInteractive()
      .on('pointerover', () => {
        this.setColor(hoverColor);
      })
      .on('pointerout', () => {
        this.setColor(this.color);
      })
      .on('pointerdown', callback);

    return this;
  }

  fadeIn(duration = 500, delay = 0): this {
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: duration,
      delay: delay,
    });

    return this;
  }

  fadeOut(duration = 500): this {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: duration,
    });

    return this;
  }
}
