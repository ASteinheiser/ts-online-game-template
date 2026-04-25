import {
  FIXED_TIME_STEP,
  WS_EVENT,
  WS_CODE,
  InputSchema,
  type InputPayload,
  type Player,
} from '@repo/core-game';
import { ROOM_ERROR } from '../../error';
import type { GameRoom } from '../index';

/** How long a held input is reused for ghost ticks before reverting to idle */
const INPUT_STALENESS_MS = 200;
/** Maximum number of queued inputs per player. Caps how far "in the past" a player's inputs can lag */
const MAX_INPUT_QUEUE_LENGTH = Math.floor(INPUT_STALENESS_MS / FIXED_TIME_STEP);

export class PlayerInput {
  constructor(private room: GameRoom) {}

  public setupPlayerInputHandler() {
    this.room.onMessage(WS_EVENT.PLAYER_INPUT, (client, payload: InputPayload) => {
      const player = this.room.state.players.get(client.sessionId);
      if (!player) {
        // do not allow reconnection, client will need to re-join to get a player
        return this.room.auth.kickClient(WS_CODE.NOT_FOUND, ROOM_ERROR.CONNECTION_NOT_FOUND, client, false);
      }

      if (!InputSchema.safeParse(payload).success) {
        return this.room.auth.kickClient(WS_CODE.BAD_REQUEST, ROOM_ERROR.INVALID_PAYLOAD, client);
      }

      // silently drop duplicate or out-of-order seqs (rare cases, mostly an extra safeguard)
      if (payload.seq <= player.lastReceivedSeq) return;
      // reject seq jumps: legit client input seq always increments by exactly 1
      if (payload.seq - player.lastReceivedSeq > 1) {
        return this.room.auth.kickClient(WS_CODE.BAD_REQUEST, ROOM_ERROR.INVALID_PAYLOAD, client);
      }

      // rate limit input messages. still advance lastReceivedSeq so input sequence is preserved
      if (!this.room.inputRateLimiter.consume(client.sessionId)) {
        player.lastReceivedSeq = payload.seq;
        return;
      }

      player.lastReceivedSeq = payload.seq;
      player.lastActivityTime = Date.now();

      // cap queue length; drop oldest to preserve most-recent input intent under jitter bursts
      if (player.inputQueue.length >= MAX_INPUT_QUEUE_LENGTH) {
        player.inputQueue.shift();
      }
      player.inputQueue.push(payload);
    });
  }

  /** Processes exactly one input per server tick so client/server physics steps stay aligned */
  public processPlayerInput(player: Player, processFunction: (input: InputPayload) => void) {
    const queuedInput = player.inputQueue.shift();
    const isLastInputStale = Date.now() - player.lastActivityTime > INPUT_STALENESS_MS;

    let input: InputPayload;
    if (queuedInput) {
      input = queuedInput;
      player.lastProcessedInputSeq = input.seq;
      player.lastProcessedInput = input;
    } else if (player.lastProcessedInput && !isLastInputStale) {
      // ghost tick: reuse the last held input
      input = player.lastProcessedInput;
    } else {
      // stale: use an idle input so e.g. gravity/physics can still run consistently
      input = {
        seq: player.lastProcessedInputSeq,
        left: false,
        right: false,
        up: false,
        down: false,
        attack: false,
      };
    }

    processFunction(input);
  }
}
