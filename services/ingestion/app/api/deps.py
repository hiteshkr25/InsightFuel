import json
import logging
from typing import Generator, Dict, Any, Optional
from fastapi import Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.redis import get_redis_client
from app.models.metadata import ApiKey, Project, Workspace
from passlib.hash import bcrypt

logger = logging.getLogger("insightfuel.ingestion")

def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

async def get_redis() -> Generator[Any, None, None]:
  client = get_redis_client()
  try:
    yield client
  finally:
    await client.aclose()

async def validate_api_key(
  request: Request,
  x_insightfuel_apikey: Optional[str] = Header(None),
  db: Session = Depends(get_db),
  redis_client: Any = Depends(get_redis)
) -> Dict[str, Any]:
  # Extract API key from header or fallback to JSON body if not present
  api_key = x_insightfuel_apikey
  if not api_key:
    try:
      body = await request.json()
      api_key = body.get("apiKey")
    except Exception:
      pass

  if not api_key:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="API Key missing"
    )

  # Check Redis cache first
  cache_key = f"apikey_cache:{api_key}"
  cached_val = await redis_client.get(cache_key)
  if cached_val:
    cached_data = json.loads(cached_val)
    if not cached_data.get("is_active"):
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Inactive or invalid API Key"
      )
    return cached_data

  # Retrieve API Keys from PostgreSQL to verify
  db_keys = db.query(ApiKey).filter(ApiKey.is_active == True).all()
  matched_key = None
  for db_key in db_keys:
    # Use passlib bcrypt verification (compatible with password hashing)
    try:
      if bcrypt.verify(api_key, db_key.key_hash):
        matched_key = db_key
        break
    except Exception:
      pass

  if not matched_key:
    # Cache negative verification for 1 minute to prevent DB hammering
    neg_data = {"is_active": False}
    await redis_client.setex(cache_key, 60, json.dumps(neg_data))
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid API Key"
    )

  # Retrieve project and organization ids
  project = db.query(Project).filter(Project.id == matched_key.project_id).first()
  if not project:
    raise HTTPException(status_code=404, detail="Project not found")

  workspace = db.query(Workspace).filter(Workspace.id == project.workspace_id).first()
  if not workspace:
    raise HTTPException(status_code=404, detail="Workspace not found")

  key_data = {
    "is_active": True,
    "project_id": project.id,
    "organization_id": workspace.organization_id
  }

  # Cache verified API Key for 5 minutes
  await redis_client.setex(cache_key, 300, json.dumps(key_data))
  return key_data

async def rate_limiter(
  request: Request,
  redis_client: Any = Depends(get_redis)
) -> None:
  # Extract API key for rate limiting
  api_key = request.headers.get("X-InsightFuel-ApiKey")
  if not api_key:
    try:
      # Peeking into body
      body = await request.json()
      api_key = body.get("apiKey")
    except Exception:
      pass

  if not api_key:
    return

  # Sliding window bucket: limit key to 100 requests per 10 seconds
  limiter_key = f"rate_limit:{api_key}"
  current = await redis_client.get(limiter_key)
  if current and int(current) >= 100:
    raise HTTPException(
      status_code=status.HTTP_429_TOO_MANY_REQUESTS,
      detail="Rate limit exceeded. Maximum 100 requests per 10 seconds."
    )

  async with redis_client.pipeline(transaction=True) as pipe:
    await pipe.incr(limiter_key)
    await pipe.expire(limiter_key, 10)
    await pipe.execute()
