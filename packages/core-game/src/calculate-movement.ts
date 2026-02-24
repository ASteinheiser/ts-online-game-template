import { PLAYER_MOVE_SPEED, MAP_SIZE } from './constants';
import type { Rectangle, EntityPosition } from './types';

export interface MovementInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export type CalculateMovementArgs = Rectangle & MovementInput;
export type CalculateMovementResult = EntityPosition;

export const calculateMovement = ({
  x,
  y,
  width,
  height,
  left,
  right,
  up,
  down,
}: CalculateMovementArgs): CalculateMovementResult => {
  let newX = x;
  let newY = y;

  if (!(left && right)) {
    if (left) newX -= PLAYER_MOVE_SPEED;
    if (right) newX += PLAYER_MOVE_SPEED;
  }
  if (!(up && down)) {
    if (up) newY -= PLAYER_MOVE_SPEED;
    if (down) newY += PLAYER_MOVE_SPEED;
  }

  const xRadius = width / 2;
  const yRadius = height / 2;
  const mapBoundX = MAP_SIZE.width - xRadius;
  const mapBoundY = MAP_SIZE.height - yRadius;

  if (newX < xRadius) newX = xRadius;
  if (newX > mapBoundX) newX = mapBoundX;
  if (newY < yRadius) newY = yRadius;
  if (newY > mapBoundY) newY = mapBoundY;

  return { x: newX, y: newY };
};
