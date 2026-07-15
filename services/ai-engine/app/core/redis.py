import logging
from typing import Optional
import redis.asyncio as redis
from app.core.config import settings

logger = logging.getLogger("insightfuel.ai-engine")

redis_pool = redis.ConnectionPool.from_url(
  settings.REDIS_URL,
  max_connections=50,
  decode_responses=True
)

def get_redis_client() -> redis.Redis:
  return redis.Redis(connection_pool=redis_pool)

async def get_cached_query(redis_client: redis.Redis, key: str) -> Optional[str]:
  try:
    return await redis_client.get(key)
  except Exception as e:
    logger.error(f"Redis cache read error: {e}")
    return None

async def set_cached_query(redis_client: redis.Redis, key: str, value: str, ttl: int = 300) -> None:
  try:
    await redis_client.setex(key, ttl, value)
  except Exception as e:
    logger.error(f"Redis cache write error: {e}")
