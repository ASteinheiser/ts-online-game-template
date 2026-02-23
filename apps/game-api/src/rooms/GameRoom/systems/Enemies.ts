import { nanoid } from 'nanoid';
import {
  MAP_SIZE,
  ENEMY_SIZE,
  ENEMY_SPAWN_RATE,
  MAX_ENEMIES,
  calculateMovement,
  Enemy,
} from '@repo/core-game';
import type { GameRoom } from '../index';

export class Enemies {
  private lastEnemySpawnTime = 0;

  constructor(private room: GameRoom) {}

  public spawnEnemy() {
    const canSpawn = Date.now() >= this.lastEnemySpawnTime + ENEMY_SPAWN_RATE;

    if (this.room.state.enemies.size < MAX_ENEMIES && canSpawn) {
      this.lastEnemySpawnTime = Date.now();

      const enemy = new Enemy();
      enemy.id = nanoid();
      enemy.x = Math.random() * MAP_SIZE.width;
      enemy.y = Math.random() * MAP_SIZE.height;

      this.room.state.enemies.set(enemy.id, enemy);
    }
  }

  /** Move the enemies randomly */
  public moveEnemy() {
    this.room.state.enemies.forEach((enemy) => {
      const moveLeft = Boolean(Math.round(Math.random()) * 1);
      const moveUp = Boolean(Math.round(Math.random()) * 1);
      const input = { left: moveLeft, right: !moveLeft, up: moveUp, down: !moveUp };

      const { x: newX, y: newY } = calculateMovement({ ...enemy, ...ENEMY_SIZE, ...input });
      enemy.x = newX;
      enemy.y = newY;
    });
  }
}
