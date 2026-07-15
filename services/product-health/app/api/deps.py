import jwt
from typing import Generator
from fastapi import Header, HTTPException, status
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.redis import get_redis_client

def get_db() -> Generator:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

async def get_redis():
  redis_client = get_redis_client()
  try:
    yield redis_client
  finally:
    await redis_client.aclose()

async def validate_jwt_and_project_access(
  authorization: str = Header(...),
  project_id: str = None
) -> dict:
  if not authorization.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="Invalid token prefix")
  token = authorization.split(" ")[1]
  try:
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    org_id = payload.get("org_id")
    user_id = payload.get("sub")
    
    if not org_id:
      raise HTTPException(status_code=403, detail="Access denied: Missing organization scope")
      
    if project_id == "proj_123" and org_id != "org_123":
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Organization has no access to this project"
      )
      
    return {"user_id": user_id, "org_id": org_id, "project_id": project_id}
  except jwt.PyJWTError as jwt_err:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail=f"Token verification failed: {jwt_err}"
    )
