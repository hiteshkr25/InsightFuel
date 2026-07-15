from datetime import datetime
from pydantic import BaseModel

class OrganizationCreate(BaseModel):
  name: str

class OrganizationResponse(BaseModel):
  id: str
  name: str
  created_at: datetime

  class Config:
    from_attributes = True

class WorkspaceCreate(BaseModel):
  name: str

class WorkspaceResponse(BaseModel):
  id: str
  name: str
  organization_id: str
  created_at: datetime

  class Config:
    from_attributes = True
