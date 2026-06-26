import json
import redis.asyncio as redis
from typing import Optional, Any
from app.core.config import settings

redis_client: Optional[redis.Redis] = None

REFRESH_TOKEN_TTL = 604800  # 7 days in seconds
REUSE_GRACE_TTL = 60        # 60 seconds grace period for reuse detection


async def init_redis_pool():
    global redis_client
    try:
        redis_client = redis.Redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=3,
        )
        # Test the connection
        await redis_client.ping()
        import structlog
        structlog.get_logger(__name__).info("redis_connected", url=settings.REDIS_URL)
    except Exception as e:
        import structlog
        structlog.get_logger(__name__).warning(
            "redis_unavailable",
            error=str(e),
            note="App will run without Redis (token rotation disabled)"
        )
        redis_client = None

async def get_redis():
    return redis_client


async def close_redis_pool():
    if redis_client:
        await redis_client.aclose()


async def ping() -> bool:
    try:
        if redis_client:
            return await redis_client.ping()
        return False
    except Exception:
        return False


async def delete_pattern(pattern: str) -> int:
    """Delete all keys matching a pattern."""
    if not redis_client:
        return 0

    count = 0
    async for key in redis_client.scan_iter(match=pattern):
        await redis_client.delete(key)
        count += 1
    return count


async def cache_or_fetch(key: str, ttl: int, fetch_func, *args, **kwargs) -> Any:
    """Helper to get from cache or fetch and set."""
    if not redis_client:
        return await fetch_func(*args, **kwargs)

    cached_val = await redis_client.get(key)
    if cached_val:
        return cached_val

    val = await fetch_func(*args, **kwargs)
    if val is not None:
        await redis_client.set(key, str(val), ex=ttl)
    return val


# ---------------------------------------------------------------------------
# Refresh Token Rotation (RTR) helpers
# ---------------------------------------------------------------------------

async def store_refresh_token(jti: str, user_id: str, family_id: str) -> None:
    """Store a new refresh token and add it to its family set."""
    if not redis_client:
        return
    payload = json.dumps({"user_id": user_id, "family_id": family_id})
    async with redis_client.pipeline(transaction=True) as pipe:
        pipe.setex(f"rt:{jti}", REFRESH_TOKEN_TTL, payload)
        pipe.sadd(f"rt_family:{family_id}", jti)
        pipe.expire(f"rt_family:{family_id}", REFRESH_TOKEN_TTL)
        await pipe.execute()


async def rotate_refresh_token(
    old_jti: str, new_jti: str, user_id: str, family_id: str
) -> None:
    """Atomically rotate refresh tokens — invalidate old, store new."""
    if not redis_client:
        return
    payload = json.dumps({"user_id": user_id, "family_id": family_id})
    async with redis_client.pipeline(transaction=True) as pipe:
        pipe.delete(f"rt:{old_jti}")
        pipe.setex(f"revoked_rt:{old_jti}", REUSE_GRACE_TTL, "reused")
        pipe.setex(f"rt:{new_jti}", REFRESH_TOKEN_TTL, payload)
        pipe.sadd(f"rt_family:{family_id}", new_jti)
        pipe.srem(f"rt_family:{family_id}", old_jti)
        pipe.expire(f"rt_family:{family_id}", REFRESH_TOKEN_TTL)
        await pipe.execute()


async def check_refresh_reuse(jti: str) -> bool:
    """Returns True if the token was recently revoked (potential reuse attack)."""
    if not redis_client:
        return False
    result = await redis_client.exists(f"revoked_rt:{jti}")
    return bool(result)


async def get_refresh_payload(jti: str) -> dict | None:
    """Get the stored payload for an active refresh token. Returns None if expired/missing."""
    if not redis_client:
        return None
    raw = await redis_client.get(f"rt:{jti}")
    if not raw:
        return None
    return json.loads(raw)


async def invalidate_token_family(family_id: str) -> None:
    """Invalidate all tokens in a family (reuse detection — security response)."""
    if not redis_client:
        return
    members = await redis_client.smembers(f"rt_family:{family_id}")
    async with redis_client.pipeline(transaction=True) as pipe:
        for member in members:
            pipe.delete(f"rt:{member}")
        pipe.delete(f"rt_family:{family_id}")
        await pipe.execute()


async def delete_refresh_token(jti: str) -> None:
    """Delete a single refresh token (used on logout)."""
    if not redis_client:
        return
    await redis_client.delete(f"rt:{jti}")
