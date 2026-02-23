import { CustomText } from './CustomText';

const MARGIN = 16;
const PADDING = 6;
const CORNER_RADIUS = 8;

export class FpsDisplay {
  private elapsedMs = 0;
  private frameCount = 0;
  private fpsText: CustomText;
  private background: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene) {
    this.background = this.scene.add.graphics().setScrollFactor(0).setDepth(102);

    this.fpsText = new CustomText(this.scene, 0, 0, '-- FPS', {
      fontFamily: 'Montserrat',
      fontSize: 14,
      color: '#00ff00',
    })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    const layout = () => {
      const { width } = this.scene.scale;
      this.fpsText.setPosition(width - MARGIN, MARGIN);
      this.updateBackgroundSize();
    };

    layout();
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, layout);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.scale.off(Phaser.Scale.Events.RESIZE, layout);
    });
  }

  public destroy() {
    this.fpsText.destroy();
    this.background.destroy();
  }

  public update(delta: number) {
    this.frameCount++;
    this.elapsedMs += delta;
    if (this.elapsedMs >= 500) {
      const fps = Math.round((this.frameCount * 1000) / this.elapsedMs);
      this.frameCount = 0;
      this.elapsedMs = 0;
      const color = this.getFpsColor(fps);
      this.fpsText.setColor(color).setText(`${fps} FPS`);
      this.updateBackgroundSize();
    }
  }

  private getFpsColor(fps: number): string {
    if (fps >= 55) return '#00ff00';
    if (fps >= 30) return '#ffff00';
    if (fps >= 15) return '#ff8800';
    return '#ff0000';
  }

  private updateBackgroundSize() {
    const bgWidth = this.fpsText.displayWidth + PADDING * 2;
    const bgHeight = this.fpsText.displayHeight + PADDING * 2;
    const bgX = this.fpsText.x - bgWidth + PADDING;
    const bgY = this.fpsText.y - PADDING;
    this.background.clear();
    this.background.fillStyle(0x000000, 0.5).fillRoundedRect(bgX, bgY, bgWidth, bgHeight, CORNER_RADIUS);
  }
}
