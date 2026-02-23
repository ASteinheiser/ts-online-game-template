import { z } from 'zod';

/** The radius of the player's view in pixels */
export const PLAYER_VIEW_RADIUS = 300;

/** The number of frames per second the player animates at (8fps) */
export const PLAYER_FRAME_RATE = 8;
/** The speed of the player in pixels per tick */
export const PLAYER_MOVE_SPEED = 4;
/** The size of the player in pixels */
export const PLAYER_SIZE = {
  width: 48,
  height: 54,
};

/** The size of the attack in pixels */
export const ATTACK_SIZE = {
  width: 6,
  height: 8,
};
/** Offset from the center of the player to the center of the fist,
 * which is at the edge of the player's bounding box */
export const ATTACK_OFFSET_X = PLAYER_SIZE.width / 2 - ATTACK_SIZE.width / 2;
/** Magic number, this is how high the fist is above the center of the player */
export const ATTACK_OFFSET_Y = 12;
/** Attack animation takes 0.625 seconds total (5 frames at 8fps) */
export const ATTACK_COOLDOWN = 625;
/** Attack damage frame is at 0.375 seconds (frame 3 / 5) */
export const ATTACK_DAMAGE__DELAY = 375;
/** Time it takes for one frame in the attack animation (in ms) */
export const ATTACK_DAMAGE__FRAME_TIME = 125;

/** The zod schema for player input */
export const InputSchema = z.object({
  seq: z.number().int().nonnegative(),
  left: z.boolean(),
  right: z.boolean(),
  up: z.boolean(),
  down: z.boolean(),
  attack: z.boolean(),
});
/** The payload for player input */
export type InputPayload = z.infer<typeof InputSchema>;
