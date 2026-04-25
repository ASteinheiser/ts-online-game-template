/** How many ticks of game logic occur per second */
export const TICKS_PER_SECOND = 64;
/** How long each tick takes in ms (64fps = 15.625ms) */
export const FIXED_TIME_STEP = 1000 / TICKS_PER_SECOND;

/** The size of the map in pixels */
export const MAP_SIZE = {
  width: 4000,
  height: 4000,
};
