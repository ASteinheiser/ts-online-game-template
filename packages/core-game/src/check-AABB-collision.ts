import type { Rectangle } from './types';

/** Check if two rectangles are colliding. Assumes the rectangles are centered on their x and y coordinates. */
export const checkAABBCollision = (rect1: Rectangle, rect2: Rectangle) => {
  const halfWidth1 = rect1.width / 2;
  const halfWidth2 = rect2.width / 2;
  const halfHeight1 = rect1.height / 2;
  const halfHeight2 = rect2.height / 2;

  return (
    rect1.x - halfWidth1 < rect2.x + halfWidth2 &&
    rect1.x + halfWidth1 > rect2.x - halfWidth2 &&
    rect1.y - halfHeight1 < rect2.y + halfHeight2 &&
    rect1.y + halfHeight1 > rect2.y - halfHeight2
  );
};
