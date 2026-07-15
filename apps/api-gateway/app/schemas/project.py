from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ProjectCreate(BaseModel):
  name: str

class ProjectResponse(BaseModel):
  id: str
  name: str
  workspace_id: str
  created_at: datetime

  class Config:
    from_attributes = True

class ApiKeyCreate(BaseModel):
  display_name: str
  expires_days: Optional[int] = None

class ApiKeyResponse(BaseModel):
  id: str
  display_name: str
  is_active: bool
  created_at: datetime
  expires_at: Optional[datetime] = None
  raw_key: Optional[str] = None # Only returned once during creation

  class Config:
    from_attributes = True
