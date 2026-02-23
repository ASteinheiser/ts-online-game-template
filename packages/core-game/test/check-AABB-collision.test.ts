import { describe, it, expect } from 'vitest';
import { checkAABBCollision } from '../src/check-AABB-collision';

describe('checkAABBCollision', () => {
  it('should return true if the rectangles are colliding', () => {
    const rect1 = { x: 0, y: 0, width: 10, height: 10 };
    const rect2 = { x: 5, y: 5, width: 10, height: 10 };

    const result = checkAABBCollision(rect1, rect2);

    expect(result).toBe(true);
  });

  it('should return false if the rectangles are not colliding', () => {
    const rect1 = { x: 0, y: 0, width: 10, height: 10 };
    const rect2 = { x: 20, y: 20, width: 10, height: 10 };

    const result = checkAABBCollision(rect1, rect2);

    expect(result).toBe(false);
  });
});
