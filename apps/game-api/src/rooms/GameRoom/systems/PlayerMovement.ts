import { MAP_SIZE, PLAYER_SIZE, calculateMovement, type InputPayload, type Player } from '@repo/core-game';
import { logger } from '../../../logger';
import { RESULTS, type GameRoom } from '../index';

export class PlayerMovement {
  constructor(private room: GameRoom) {}

  public spawnPlayer(clientId: string, player: Player, isExistingPlayer: boolean) {
    logger.info({
      message: `${isExistingPlayer ? 'Reconnecting' : 'New'} player joined!`,
      data: { roomId: this.room.roomId, clientId, userName: player.username },
    });

    if (isExistingPlayer) {
      // players should have inputs cleared on reconnection
      player.inputQueue = [];
      // existing players already have a position, so we don't need to spawn them
    } else {
      player.x = Math.random() * MAP_SIZE.width;
      player.y = Math.random() * MAP_SIZE.height;
    }

    this.room.state.players.set(clientId, player);

    if (!RESULTS[this.room.roomId]) RESULTS[this.room.roomId] = {};
    RESULTS[this.room.roomId][player.userId] = {
      username: player.username,
      attackCount: player.attackCount,
      killCount: player.killCount,
    };
  }

  public handleInput(player: Player, input: InputPayload) {
    if (input.left) player.isFacingRight = false;
    else if (input.right) player.isFacingRight = true;

    const newPosition = calculateMovement({
      x: player.x,
      y: player.y,
      ...PLAYER_SIZE,
      ...input,
    });

    player.x = newPosition.x;
    player.y = newPosition.y;
  }
}
