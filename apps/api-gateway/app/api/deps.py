from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
  tokenUrl="/api/v1/auth/login/access-token"
)

def get_db() -> Generator[Session, None, None]:
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

async def get_current_user(
  db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
  payload = decode_token(token)
  token_sub = payload.get("sub")
  token_type = payload.get("type")
  
  if not token_sub or token_type != "access":
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Could not validate credentials",
    )
    
  user = db.query(User).filter(User.id == token_sub).first()
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  if not user.is_active:
    raise HTTPException(status_code=400, detail="Inactive user")
    
  return user

class RoleGuard:
  def __init__(self, allowed_roles: list[str]):
    self.allowed_roles = allowed_roles

  def __call__(
    self, 
    org_id: str, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
  ) -> str:
    from app.models.user import UserOrganizationRole
    
    role_entry = db.query(UserOrganizationRole).filter(
      UserOrganizationRole.user_id == current_user.id,
      UserOrganizationRole.organization_id == org_id
    ).first()
    
    if not role_entry or role_entry.role not in self.allowed_roles:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Permission denied: insufficient organization role privileges"
      )
      
    return role_entry.role
