import uuid
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
  UserCreate,
  UserResponse,
  TokenResponse,
  PasswordResetRequest,
  PasswordResetConfirm
)

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(deps.get_db)):
  # Check if email is already taken
  existing_user = db.query(User).filter(User.email == user_in.email).first()
  if existing_user:
    raise HTTPException(
      status_code=400,
      detail="The user with this email already exists in the system."
    )
  
  # Create new user
  hashed_password = security.get_password_hash(user_in.password)
  new_user = User(
    email=user_in.email,
    password_hash=hashed_password,
    first_name=user_in.first_name,
    last_name=user_in.last_name,
    verification_token=str(uuid.uuid4())
  )
  db.add(new_user)
  db.commit()
  db.refresh(new_user)
  return new_user

@router.post("/login/access-token", response_model=TokenResponse)
def login_access_token(
  form_data: OAuth2PasswordRequestForm = Depends(),
  db: Session = Depends(deps.get_db)
):
  # Authenticate user
  user = db.query(User).filter(User.email == form_data.username).first()
  if not user or not security.verify_password(form_data.password, user.password_hash):
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Incorrect email or password"
    )
  if not user.is_active:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Inactive user account"
    )

  access_token = security.create_access_token(subject=user.id)
  refresh_token = security.create_refresh_token(subject=user.id)
  
  return {
    "access_token": access_token,
    "refresh_token": refresh_token,
    "token_type": "bearer"
  }

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(token: str, db: Session = Depends(deps.get_db)):
  payload = security.decode_token(token)
  token_sub = payload.get("sub")
  token_type = payload.get("type")

  if not token_sub or token_type != "refresh":
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="Invalid refresh token"
    )

  user = db.query(User).filter(User.id == token_sub).first()
  if not user or not user.is_active:
    raise HTTPException(
      status_code=status.HTTP_400_BAD_REQUEST,
      detail="User associated with token is inactive or not found"
    )

  access_token = security.create_access_token(subject=user.id)
  new_refresh_token = security.create_refresh_token(subject=user.id)
  
  return {
    "access_token": access_token,
    "refresh_token": new_refresh_token,
    "token_type": "bearer"
  }

@router.post("/verify")
def verify_email(token: str, db: Session = Depends(deps.get_db)):
  user = db.query(User).filter(User.verification_token == token).first()
  if not user:
    raise HTTPException(
      status_code=400,
      detail="Invalid or expired verification token."
    )
  
  user.is_verified = True
  user.verification_token = None
  db.commit()
  return {"message": "Email verified successfully."}

@router.post("/password-reset-request")
def password_reset_request(req: PasswordResetRequest, db: Session = Depends(deps.get_db)):
  user = db.query(User).filter(User.email == req.email).first()
  if user:
    user.reset_token = str(uuid.uuid4())
    db.commit()
  # Return success message regardless of user existence to prevent user enumeration attacks
  return {"message": "Password reset token generated. Verification instructions sent."}

@router.post("/password-reset-confirm")
def password_reset_confirm(req: PasswordResetConfirm, db: Session = Depends(deps.get_db)):
  user = db.query(User).filter(User.reset_token == req.token).first()
  if not user:
    raise HTTPException(
      status_code=400,
      detail="Invalid or expired reset token."
    )
  
  user.password_hash = security.get_password_hash(req.new_password)
  user.reset_token = None
  db.commit()
  return {"message": "Password has been successfully updated."}
