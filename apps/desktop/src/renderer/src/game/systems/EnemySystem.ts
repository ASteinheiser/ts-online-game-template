import { Enemy } from '../objects/Enemy';
import type { Game } from '../scenes/Game';
import type { RoomEventCallbacks } from './RoomSystem';

/** The speed of the enemy in pixels per tick (independent of frame rate) */
const LERP_SPEED = 15;

export class EnemySystem {
  private enemies: Record<string, Enemy> = {};

  constructor(private scene: Game) {}

  public destroy() {
    Object.values(this.enemies).forEach((enemy) => enemy.destroy());
    this.enemies = {};
  }

  public handleEnemyAdded: RoomEventCallbacks['onEnemyAdded'] = (enemy, $) => {
    const entity = new Enemy(this.scene, enemy.x, enemy.y);
    entity.serverX = enemy.x;
    entity.serverY = enemy.y;
    this.enemies[enemy.id] = entity;

    $(enemy).onChange(() => {
      entity.serverX = enemy.x;
      entity.serverY = enemy.y;
    });
  };

  public handleEnemyRemoved: RoomEventCallbacks['onEnemyRemoved'] = (enemy) => {
    const foundEnemy = this.enemies[enemy.id];
    if (foundEnemy) {
      foundEnemy.destroy();
      delete this.enemies[enemy.id];
    }
  };

  public interpolateEnemies(delta: number) {
    for (const id in this.enemies) {
      const enemy = this.enemies[id];
      const { serverX, serverY } = enemy;
      if (serverX === undefined || serverY === undefined) continue;

      const alpha = Math.min(1, (LERP_SPEED * delta) / 1000);
      enemy.move(
        Phaser.Math.Linear(enemy.entity.x, serverX, alpha),
        Phaser.Math.Linear(enemy.entity.y, serverY, alpha)
      );
    }
  }
}
