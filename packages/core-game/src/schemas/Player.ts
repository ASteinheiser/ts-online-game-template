import { Schema, type } from '@colyseus/schema';
import type { InputPayload } from '../constants/player';

export class Player extends Schema {
  /** Identity fields */
  userId!: string;
  tokenExpiresAt!: number;
  @type('string') username!: string;
  /** Position and animation fields */
  @type('number') x!: number;
  @type('number') y!: number;
  @type('boolean') isFacingRight: boolean = true;
  @type('boolean') isAttacking: boolean = false;
  /** Private player information for active player */
  @type('number') killCount: number = 0;
  /** Latest input sequence processed by the server (used for client reconciliation) */
  @type('number') lastProcessedInputSeq: number = 0;
  /** Server-side input fields */
  lastProcessedInput?: InputPayload;
  inputQueue: Array<InputPayload> = [];
  /** Highest `seq` the server has accepted from the client, used to reject duplicate/old/spoofed inputs */
  lastReceivedSeq: number = -1;
  lastActivityTime: number = Date.now();
  lastAttackTime: number = 0;
  attackCount: number = 0;
  /** Debug fields */
  @type('number') attackDamageFrameX?: number;
  @type('number') attackDamageFrameY?: number;
}
