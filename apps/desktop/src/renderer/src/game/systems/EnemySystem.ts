import { Enemy } from '../objects/Enemy';
import type { Game } from '../scenes/Game';
import type { RoomEventCallbacks } from './RoomSystem';

export class EnemySystem {
  private enemies: Record<string, Enemy> = {};

  constructor(private scene: Game) {}

  public destroy() {
    Object.values(this.enemies).forEach((enemy) => enemy.destroy());
    this.enemies = {};
  }

  public handleEnemyAdded: RoomEventCallbacks['onEnemyAdded'] = (enemy, $) => {
    const entity = new Enemy(this.scene, enemy.x, enemy.y);
    this.enemies[enemy.id] = entity;

    $(enemy).onChange(() => {
      entity.move(enemy.x, enemy.y);
    });
  };

  public handleEnemyRemoved: RoomEventCallbacks['onEnemyRemoved'] = (enemy) => {
    const foundEnemy = this.enemies[enemy.id];
    if (foundEnemy) {
      foundEnemy.destroy();
      delete this.enemies[enemy.id];
    }
  };
}
