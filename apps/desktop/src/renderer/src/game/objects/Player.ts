import { ATTACK_DAMAGE__DELAY } from '@repo/core-game';
import { SOUND } from '../constants';

/** Used to handle slight differences in player position due to interpolation of server values */
const MOVEMENT_THRESHOLD = 0.1;

export const PLAYER_ANIM = {
  IDLE: 'playerIdle',
  WALK: 'playerWalk',
  PUNCH: 'playerPunch',
};

export class Player {
  entity: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  nameText: Phaser.GameObjects.Text;
  punchSfx: Phaser.Sound.BaseSound;
  hitSfx: Phaser.Sound.BaseSound;
  killCount = 0;

  constructor(
    scene: Phaser.Scene,
    entity: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    nameText: Phaser.GameObjects.Text
  ) {
    this.entity = entity;
    this.nameText = nameText;
    this.punchSfx = scene.sound.add(SOUND.PUNCH);
    this.hitSfx = scene.sound.add(SOUND.ENEMY_HIT);
  }

  /** Force the player to move to a specific position, skips animations, interpolation, etc. */
  forceMove({ x, y }: { x: number; y: number }) {
    this.entity.x = x;
    this.entity.y = y;
    this.nameText.x = x;
    this.nameText.y = y;
  }

  move({ x, y }: { x: number; y: number }) {
    const isMovingX = Math.abs(this.entity.x - x) > MOVEMENT_THRESHOLD;
    const isMovingY = Math.abs(this.entity.y - y) > MOVEMENT_THRESHOLD;
    const isMoving = isMovingX || isMovingY;

    if (isMovingX) {
      this.entity.setFlipX(this.entity.x > x);
    }

    this.entity.x = x;
    this.entity.y = y;
    this.nameText.x = x;
    this.nameText.y = y;

    if (!isMoving && !this.isPunching()) {
      this.entity.play(PLAYER_ANIM.IDLE);
    }
    if (isMoving && !(this.isPunching() || this.isWalking())) {
      this.entity.play(PLAYER_ANIM.WALK);
    }
  }

  punch() {
    if (this.isPunching()) return;

    this.entity.anims.play(PLAYER_ANIM.PUNCH);
    this.punchSfx.play('', { delay: ATTACK_DAMAGE__DELAY / 1000 });
  }

  hit() {
    this.hitSfx.play();
  }

  stopPunch() {
    if (!this.isPunching()) return;
    this.entity.anims.stop();
  }

  isPunching() {
    return this.entity.anims.isPlaying && this.entity.anims.currentAnim?.key === PLAYER_ANIM.PUNCH;
  }

  isWalking() {
    return this.entity.anims.isPlaying && this.entity.anims.currentAnim?.key === PLAYER_ANIM.WALK;
  }

  destroy() {
    this.entity.destroy();
    this.nameText.destroy();
    this.punchSfx.destroy();
    this.hitSfx.destroy();
  }
}
