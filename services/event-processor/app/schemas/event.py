from typing import Optional, Dict, Any
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

class InsightFuelEventRaw(BaseModel):
  event_id: str
  event_name: str
  category: str
  distinct_id: str
  timestamp: str
  properties: Optional[Dict[str, Any]] = None
  context: Optional[EventContext] = None

  # Ingest Enrichment Fields
  received_at: str
  ingestion_id: str
  project_id: str
  organization_id: str
  ip_address: str
  browser: Optional[str] = None
  os: Optional[str] = None
  device: Optional[str] = None

class InsightFuelEventProcessed(InsightFuelEventRaw):
  processed_at: str
  processing_latency: float
  worker_id: str
  processing_version: str
