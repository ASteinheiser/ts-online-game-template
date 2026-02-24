import { ATTACK_SIZE } from '@repo/core-game';

/** How long the punch box should be visible in ms */
const PUNCH_BOX_LIFETIME = 2000;

export class PunchBox {
  private punchBox: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    const { width, height } = ATTACK_SIZE;
    this.punchBox = scene.add.rectangle(x, y, width, height, color, 0.5).setDepth(99);

    scene.time.delayedCall(PUNCH_BOX_LIFETIME, () => {
      this.destroy();
    });
  }

  private destroy() {
    this.punchBox.destroy();
  }
}
