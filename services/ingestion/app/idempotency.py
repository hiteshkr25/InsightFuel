import uuid
from typing import Any

def validate_event_id(event_id: str) -> bool:
  """
  Validates that the event_id is a syntactically correct UUID Version 4.
  """
  try:
    val = uuid.UUID(event_id)
    return val.version == 4
  except ValueError:
    return False

async def check_and_set_duplicate(redis_client: Any, event_id: str, ttl: int = 3600) -> bool:
  """
  Checks if an event_id is already in Redis (duplicate).
  If it doesn't exist, records it with the specified TTL and returns False.
  If it exists, returns True.
  """
  dup_key = f"dup:{event_id}"
  # Check if key is already set
  exists = await redis_client.get(dup_key)
  if exists:
    return True
  
  # Set key to block duplicates
  await redis_client.setex(dup_key, ttl, "1")
  return False
