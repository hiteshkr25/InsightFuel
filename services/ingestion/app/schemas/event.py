from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EventContext(BaseModel):
  url: Optional[str] = None
  referrer: Optional[str] = None
  browser: Optional[str] = None
  os: Optional[str] = None
  device: Optional[str] = None
  session_id: Optional[str] = None
  sdk_version: Optional[str] = None
  screen_width: Optional[int] = None
  screen_height: Optional[int] = None
  viewport_width: Optional[int] = None
  viewport_height: Optional[int] = None
  language: Optional[str] = None

class InsightFuelEventSchema(BaseModel):
  event_id: str
  event_name: str
  category: str = Field(..., description="custom, navigation, performance, error, feature, business, system, session, user")
  distinct_id: str
  timestamp: str
  properties: Optional[Dict[str, Any]] = None
  context: Optional[EventContext] = None

class IngestBatchRequest(BaseModel):
  events: List[InsightFuelEventSchema]
  apiKey: str
  sentAt: str
