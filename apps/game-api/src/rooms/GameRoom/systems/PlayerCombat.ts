import {
  ATTACK_SIZE,
  ATTACK_OFFSET_X,
  ATTACK_OFFSET_Y,
  ATTACK_COOLDOWN,
  ATTACK_DAMAGE__DELAY,
  ATTACK_DAMAGE__FRAME_TIME,
  ENEMY_SIZE,
  checkAABBCollision,
  type InputPayload,
  type Player,
} from '@repo/core-game';
import { RESULTS, type GameRoom } from '../index';

export class PlayerCombat {
  constructor(private room: GameRoom) {}

  public handleInput(player: Player, input: InputPayload) {
    const currentTime = Date.now();
    const timeSinceLastAttack = currentTime - player.lastAttackTime;

    if (this.isInDamageFrame(timeSinceLastAttack)) {
      this.setDamageFrame(player);
      this.checkForEnemyHits(player);
    } else {
      player.attackDamageFrameX = undefined;
      player.attackDamageFrameY = undefined;
    }

    const isInAttackFrame = timeSinceLastAttack < ATTACK_COOLDOWN;
    // if the player is mid-attack, don't process any more inputs
    if (isInAttackFrame) {
      return;
    } else if (input.attack) {
      player.isAttacking = true;
      player.attackCount++;
      player.lastAttackTime = currentTime;
    } else {
      player.isAttacking = false;
    }
  }

  /** Check if the player is in the damage frame of the attack animation */
  private isInDamageFrame(timeSinceLastAttack: number) {
    return (
      timeSinceLastAttack >= ATTACK_DAMAGE__DELAY &&
      timeSinceLastAttack < ATTACK_DAMAGE__DELAY + ATTACK_DAMAGE__FRAME_TIME
    );
  }

  /** Calculate and set the damage frame */
  private setDamageFrame(player: Player) {
    player.attackDamageFrameX = player.isFacingRight
      ? player.x + ATTACK_OFFSET_X
      : player.x - ATTACK_OFFSET_X;
    player.attackDamageFrameY = player.y - ATTACK_OFFSET_Y;
  }

  /** Check if the damage frame hit an enemy */
  private checkForEnemyHits(player: Player) {
    this.room.state.enemies.forEach((enemy) => {
      if (
        player.attackDamageFrameX &&
        player.attackDamageFrameY &&
        checkAABBCollision(
          {
            x: enemy.x,
            y: enemy.y,
            ...ENEMY_SIZE,
          },
          {
            x: player.attackDamageFrameX,
            y: player.attackDamageFrameY,
            ...ATTACK_SIZE,
          }
        )
      ) {
        this.room.state.enemies.delete(enemy.id);
        player.killCount++;
        RESULTS[this.room.roomId][player.userId].killCount++;
      }
    });
  }
}
