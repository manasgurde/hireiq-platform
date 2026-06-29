import time
from fastapi import HTTPException, Request, status
from app.core.redis import redis_client

# ---------------------------------------------------------------------------
# Lua script for atomic sliding window rate limiting
# ---------------------------------------------------------------------------
RATE_LIMIT_LUA = """
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

-- Remove all entries outside the current window
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_ms)

-- Count current requests in window
local count = redis.call('ZCARD', key)

if count < limit then
    -- Add the new request (score=timestamp, member=timestamp+random for uniqueness)
    local member = now .. ':' .. math.random(1, 1000000)
    redis.call('ZADD', key, now, member)
    -- Expire the key after the window duration
    redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
    return 1
else
    return 0
end
"""


class SlidingWindowRateLimiter:
    """FastAPI callable dependency implementing a Redis sliding window rate limiter.

    Uses an atomic Lua script to avoid race conditions.
    Key format: rate:{path}:{client_ip}
    """

    def __init__(self, requests: int = 10, window_seconds: int = 60) -> None:
        self.requests = requests
        self.window_ms = window_seconds * 1000
        self.window_seconds = window_seconds

    async def __call__(self, request: Request) -> None:
        if not redis_client:
            # If Redis is unavailable, skip rate limiting (fail-open)
            return

        client_host = request.client.host if request.client else "unknown"
        key = f"rate:{request.url.path}:{client_host}"
        now_ms = int(time.time() * 1000)

        try:
            result = await redis_client.eval(
                RATE_LIMIT_LUA,
                1,              # number of keys
                key,
                now_ms,
                self.window_ms,
                self.requests,
            )
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please slow down.",
                    headers={"Retry-After": str(self.window_seconds)},
                )
        except HTTPException:
            raise
        except Exception:
            # If Lua script fails (e.g. Redis connection issue), fail-open
            pass


# Pre-built rate limiter instances
auth_rate_limiter = SlidingWindowRateLimiter(requests=10, window_seconds=60)
api_rate_limiter = SlidingWindowRateLimiter(requests=100, window_seconds=60)
