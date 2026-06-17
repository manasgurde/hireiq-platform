import redis.asyncio as redis
from typing import Optional, Any
from app.core.config import settings

redis_client: Optional[redis.Redis] = None

async def init_redis_pool():
    global redis_client
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

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
