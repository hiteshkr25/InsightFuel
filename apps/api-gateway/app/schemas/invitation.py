from datetime import datetime
from pydantic import BaseModel, EmailStr

class InvitationCreate(BaseModel):
  email: EmailStr
  role: str = "Viewer" # Owner, Admin, Developer, Viewer

class InvitationResponse(BaseModel):
  id: str
  organization_id: str
  email: EmailStr
  role: str
  token: str
  status: str
  expires_at: datetime
  created_at: datetime

  class Config:
    from_attributes = True
