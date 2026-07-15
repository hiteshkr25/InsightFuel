import re
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from app.schemas.event import InsightFuelEventRaw, InsightFuelEventProcessed

logger = logging.getLogger("insightfuel.event-processor")

# Secondary layer PII Scrub regex rules
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
CC_REGEX = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
SSN_REGEX = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")

def scrub_pii_recursive(value: Any) -> Any:
  if isinstance(value, str):
    val = EMAIL_REGEX.sub("[EMAIL_MASKED]", value)
    val = CC_REGEX.sub("[CREDIT_CARD_MASKED]", val)
    val = SSN_REGEX.sub("[SSN_MASKED]", val)
    return val
  elif isinstance(value, dict):
    return {k: scrub_pii_recursive(v) for k, v in value.items()}
  elif isinstance(value, list):
    return [scrub_pii_recursive(v) for v in value]
  return value

def process_event(raw_event_dict: Dict[str, Any], worker_id: str) -> Dict[str, Any]:
  """
  Validates raw event shapes, performs PII scrubs, normalizes timestamps,
  and adds processing latency metrics.
  """
  start_time = time.time()

  # 1. Schema Validation
  raw_event = InsightFuelEventRaw.model_validate(raw_event_dict)

  # 2. PII Verification & Hashing/Masking
  scrubbed_props = scrub_pii_recursive(raw_event.properties)

  # 3. Timestamp Normalization
  processed_time = datetime.now(timezone.utc)
  
  try:
    received_time = datetime.fromisoformat(raw_event.received_at.replace("Z", "+00:00"))
  except Exception:
    received_time = processed_time

  # Calculate processing latency (ingest receipt -> processed)
  latency = (processed_time - received_time).total_seconds()
  if latency < 0:
    latency = 0.0

  # 4. Processing Enrichments
  processed_event = InsightFuelEventProcessed(
    event_id=raw_event.event_id,
    event_name=raw_event.event_name,
    category=raw_event.category,
    distinct_id=raw_event.distinct_id,
    timestamp=raw_event.timestamp,
    properties=scrubbed_props,
    context=raw_event.context,
    received_at=raw_event.received_at,
    ingestion_id=raw_event.ingestion_id,
    project_id=raw_event.project_id,
    organization_id=raw_event.organization_id,
    ip_address=raw_event.ip_address,
    browser=raw_event.browser,
    os=raw_event.os,
    device=raw_event.device,
    
    # Ingestion worker processing headers
    processed_at=processed_time.isoformat(),
    processing_latency=float(latency),
    worker_id=worker_id,
    processing_version="1.0.0"
  )

  return processed_event.model_dump()
