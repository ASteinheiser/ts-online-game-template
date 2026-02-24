import { ENEMY_SIZE } from '@repo/core-game';
import { ASSET } from '../constants';

export class Enemy {
  public entity: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private hitbox: Phaser.GameObjects.Rectangle;
  public serverX?: number;
  public serverY?: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.entity = scene.physics.add.sprite(x, y, ASSET.ENEMY);
    this.hitbox = scene.add.rectangle(x, y, ENEMY_SIZE.width, ENEMY_SIZE.height);
    this.hitbox.setStrokeStyle(1, 0xff00ff);
  }

  public destroy() {
    this.entity.destroy();
    this.hitbox.destroy();
  }

  public move(x: number, y: number) {
    this.entity.x = x;
    this.entity.y = y;
    this.hitbox.x = x;
    this.hitbox.y = y;
  }
}
