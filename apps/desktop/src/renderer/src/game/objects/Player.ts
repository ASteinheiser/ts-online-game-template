import type * as Phaser from 'phaser';
import { ATTACK_DAMAGE__DELAY, type EntityPosition } from '@repo/core-game';
import { ASSET, SOUND } from '../constants';
import { CustomText } from './CustomText';

const DEBUG_BOX_COLOR = 0x0000ff; // blue
const DEBUG_BOX_FLASH_COLOR = 0xff0000; // red
const DEBUG_BOX_FLASH_MS = 500;

interface MoveIntent {
  delta: number;
  isMoving: boolean;
  isMovingX: boolean;
  isMovingY: boolean;
}

export const PLAYER_ANIM = {
  IDLE: 'playerIdle',
  WALK: 'playerWalk',
  PUNCH: 'playerPunch',
};

export class Player {
  public entity: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public nameText: CustomText;
  public debugBox?: Phaser.GameObjects.Rectangle;
  private debugFlashTimer?: Phaser.Time.TimerEvent;
  private punchSfx: Phaser.Sound.BaseSound;
  private hitSfx: Phaser.Sound.BaseSound;
  /** The number of enemies killed by this player */
  public killCount = 0;
  /** Handles delaying the idle animation to prevent flickering on high FPS */
  private idleAccumulator = 0;
  private displayedMoving = false;
  private static readonly IDLE_BUFFER_MS = 50;

  constructor(
    private scene: Phaser.Scene,
    username: string,
    x: number,
    y: number
  ) {
    this.entity = scene.physics.add.sprite(x, y, ASSET.PLAYER).setDepth(101);

    this.nameText = new CustomText(scene, x, y, username, {
      fontFamily: 'Tiny5',
      fontSize: 12,
    })
      .setOrigin(0.5, 2.75)
      .setDepth(101);

    this.punchSfx = scene.sound.add(SOUND.PUNCH);
    this.hitSfx = scene.sound.add(SOUND.ENEMY_HIT);
  }

  public createDebugBox() {
    this.debugBox = this.scene.add
      .rectangle(this.entity.x, this.entity.y, this.entity.width, this.entity.height)
      .setDepth(101)
      .setStrokeStyle(1, DEBUG_BOX_COLOR);
  }

  public destroy() {
    this.entity.destroy();
    this.nameText.destroy();
    this.punchSfx.destroy();
    this.hitSfx.destroy();
    this.debugBox?.destroy();
    this.debugFlashTimer?.remove(false);
  }

  /** Force the player to move to a specific position, skips animations, interpolation, etc. */
  public forceMove({ x, y }: EntityPosition) {
    this.entity.x = x;
    this.entity.y = y;
    this.nameText.x = x;
    this.nameText.y = y;

    if (!this.debugBox) return;
    this.debugBox.setStrokeStyle(1, DEBUG_BOX_FLASH_COLOR);
    this.debugFlashTimer?.remove(false);
    this.debugFlashTimer = this.scene.time.delayedCall(DEBUG_BOX_FLASH_MS, () => {
      this.debugBox?.setStrokeStyle(1, DEBUG_BOX_COLOR);
    });
  }

  public move({ x, y }: EntityPosition, { delta, isMoving, isMovingX }: MoveIntent) {
    // Asymmetric buffer: switch to WALK immediately, delay switching to IDLE
    if (isMoving) {
      this.idleAccumulator = 0;
      this.displayedMoving = true;
    } else {
      this.idleAccumulator += delta;
      if (this.idleAccumulator >= Player.IDLE_BUFFER_MS) {
        this.idleAccumulator = 0;
        this.displayedMoving = false;
      }
    }

    if (isMovingX) {
      this.entity.setFlipX(this.entity.x > x);
    }

    this.entity.x = x;
    this.entity.y = y;
    this.nameText.x = x;
    this.nameText.y = y;

    if (!this.displayedMoving && !this.isPunching()) {
      this.entity.play(PLAYER_ANIM.IDLE);
    }
    if (this.displayedMoving && !(this.isPunching() || this.isWalking())) {
      this.entity.play(PLAYER_ANIM.WALK);
    }
  }

  public hit() {
    this.hitSfx.play();
  }

  public punch() {
    if (this.isPunching()) return;

    this.entity.anims.play(PLAYER_ANIM.PUNCH);
    this.punchSfx.play('', { delay: ATTACK_DAMAGE__DELAY / 1000 });
  }

  public stopPunch() {
    if (!this.isPunching()) return;
    this.entity.anims.stop();
  }

  private isPunching() {
    return this.entity.anims.isPlaying && this.entity.anims.currentAnim?.key === PLAYER_ANIM.PUNCH;
  }

  private isWalking() {
    return this.entity.anims.isPlaying && this.entity.anims.currentAnim?.key === PLAYER_ANIM.WALK;
  }
}
