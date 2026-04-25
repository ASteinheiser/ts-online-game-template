import { TICKS_PER_SECOND } from '@repo/core-game';

/** Token-bucket capacity per client for `PLAYER_INPUT` messages. Short, legitimate bursts of input
 * are limited by this capacity. Exploiters drain this and are limited by the refill rate/second */
const INPUT_RATE_LIMIT_CAPACITY = TICKS_PER_SECOND / 2;
/** Token-bucket refill rate per client in messages per second. Sized at 2x
 * the steady-state client send rate (64 Hz) so legitimate clients never run dry. */
const INPUT_RATE_LIMIT_REFILL_PER_SEC = TICKS_PER_SECOND * 2;

interface Bucket {
  tokens: number;
  lastRefill: number;
}

/** Per-session token-bucket rate limiter for `PLAYER_INPUT` messages.
 * Prevents clients from flooding the server with input messages */
export class InputRateLimiter {
  private buckets = new Map<string, Bucket>();

  /** Try to consume one token. Returns true if allowed, false if the caller must drop. */
  public consume(sessionId: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(sessionId);
    if (!bucket) {
      bucket = { tokens: INPUT_RATE_LIMIT_CAPACITY, lastRefill: now };
      this.buckets.set(sessionId, bucket);
    }

    const elapsedSec = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(
      INPUT_RATE_LIMIT_CAPACITY,
      bucket.tokens + elapsedSec * INPUT_RATE_LIMIT_REFILL_PER_SEC
    );
    bucket.lastRefill = now;

    if (bucket.tokens < 1) return false;
    bucket.tokens -= 1;
    return true;
  }

  public cleanupPlayer(sessionId: string) {
    this.buckets.delete(sessionId);
  }
}
