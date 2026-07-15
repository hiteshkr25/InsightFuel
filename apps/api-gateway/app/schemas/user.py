from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
  email: EmailStr
  password: str = Field(..., min_length=8)
  first_name: Optional[str] = None
  last_name: Optional[str] = None

class UserLogin(BaseModel):
  email: EmailStr
  password: str

class UserResponse(BaseModel):
  id: str
  email: EmailStr
  first_name: Optional[str] = None
  last_name: Optional[str] = None
  is_active: bool
  is_verified: bool

  class Config:
    from_attributes = True

class TokenResponse(BaseModel):
  access_token: str
  refresh_token: str
  token_type: str = "bearer"

class PasswordResetRequest(BaseModel):
  email: EmailStr

class PasswordResetConfirm(BaseModel):
  token: str
  new_password: str = Field(..., min_length=8)
