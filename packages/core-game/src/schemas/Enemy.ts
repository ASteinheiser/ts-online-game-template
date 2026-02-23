import { Schema, type } from '@colyseus/schema';

export class Enemy extends Schema {
  @type('string') id!: string;
  @type('number') x!: number;
  @type('number') y!: number;
}
