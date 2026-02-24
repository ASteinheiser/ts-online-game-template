import { WS_EVENT, WS_CODE, InputSchema, type InputPayload, type Player } from '@repo/core-game';
import { ROOM_ERROR } from '../../error';
import type { GameRoom } from '../index';

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

      player.lastActivityTime = Date.now();
      player.inputQueue.push(payload);
    });
  }

  public processPlayerInput(player: Player, processFunction: (input: InputPayload) => void) {
    let input: InputPayload | undefined;
    // dequeue player inputs
    while ((input = player.inputQueue.shift())) {
      // acknowledge the input to the client (updates will be batched, so we can call this first)
      player.lastProcessedInputSeq = input.seq;
      // allow the input to be processed by whatever systems
      processFunction(input);
    }
  }
}
