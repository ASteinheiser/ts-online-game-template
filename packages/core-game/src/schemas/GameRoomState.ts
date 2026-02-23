import { MapSchema, Schema, type } from '@colyseus/schema';
import { Player } from './Player';
import { Enemy } from './Enemy';

export class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Enemy }) enemies = new MapSchema<Enemy>();
}
