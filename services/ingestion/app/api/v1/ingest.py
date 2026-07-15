import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Header, Request, status, HTTPException
from user_agents import parse as parse_ua
from app.api import deps
from app.schemas.event import IngestBatchRequest, InsightFuelEventSchema
from app.core.kafka import kafka_manager
from app.core.config import settings
from app.idempotency import validate_event_id, check_and_set_duplicate

router = APIRouter()
logger = logging.getLogger("insightfuel.ingestion")

# PII Regex compile rules matching DES and SDK specs
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

def parse_user_agent(ua_string: str) -> Dict[str, str]:
  if not ua_string:
    return {"browser": "unknown", "os": "unknown", "device": "unknown"}
  try:
    ua = parse_ua(ua_string)
    device_type = "pc"
    if ua.is_mobile:
      device_type = "mobile"
    elif ua.is_tablet:
      device_type = "tablet"
    return {
      "browser": ua.browser.family,
      "os": ua.os.family,
      "device": device_type
    }
  except Exception:
    return {"browser": "unknown", "os": "unknown", "device": "unknown"}

def anonymize_ip(ip: str) -> str:
  if not ip:
    return "0.0.0.0"
  # Mask last octet to protect user privacy
  if "." in ip:
    parts = ip.split(".")
    parts[-1] = "0"
    return ".".join(parts)
  elif ":" in ip:
    parts = ip.split(":")
    parts[-1] = "0"
    return ":".join(parts)
  return ip

@router.post("/", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(deps.rate_limiter)])
async def ingest_events(
  batch: IngestBatchRequest,
  request: Request,
  user_agent: str = Header(""),
  api_key_data: Dict[str, Any] = Depends(deps.validate_api_key),
  redis_client: Any = Depends(deps.get_redis)
):
  client_ip = request.client.host if request.client else "0.0.0.0"
  anonymized_ip = anonymize_ip(client_ip)
  
  ua_details = parse_user_agent(user_agent)

  project_id = api_key_data["project_id"]
  organization_id = api_key_data["organization_id"]

  ingested_count = 0
  duplicate_count = 0
  processed_events: List[Dict[str, Any]] = []

  for event in batch.events:
    # 1. Event ID Validation (check UUID Version 4 syntax)
    if not validate_event_id(event.event_id):
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Invalid event ID: {event.event_id}. Must be a valid UUID v4."
      )

    # 2. Duplicate Detection Check
    is_duplicate = await check_and_set_duplicate(redis_client, event.event_id)
    if is_duplicate:
      duplicate_count += 1
      continue

    # 3. PII Detection and Masking/Scrubbing
    scrubbed_properties = scrub_pii_recursive(event.properties)

    # 4. Metadata Enrichment
    enriched_event = {
      "event_id": event.event_id,
      "event_name": event.event_name,
      "category": event.category,
      "distinct_id": event.distinct_id,
      "timestamp": event.timestamp,
      "properties": scrubbed_properties,
      "context": event.context.model_dump() if event.context else {},
      
      # Enrichment Metadata
      "received_at": datetime.now(timezone.utc).isoformat(),
      "ingestion_id": str(uuid.uuid4()),
      "project_id": project_id,
      "organization_id": organization_id,
      "ip_address": anonymized_ip,
      
      # User-Agent Enrichments
      "browser": ua_details["browser"],
      "os": ua_details["os"],
      "device": ua_details["device"]
    }

    # 5. Async Queue Publishing
    published = await kafka_manager.send_event(settings.KAFKA_TOPIC, enriched_event)
    if not published:
      logger.warning(f"Kafka transport failure. Event spooled to DLQ storage: {event.event_id}")

    ingested_count += 1
    processed_events.append(enriched_event)

  return {
    "status": "success",
    "ingested": ingested_count,
    "duplicates": duplicate_count,
    "batch_size": len(batch.events)
  }

@router.post("/admin/dlq/replay", status_code=status.HTTP_200_OK)
async def replay_dlq_events(
  x_admin_token: str = Header(...),
  db = Depends(deps.get_db)
):
  """
  Admin tool endpoint to replay failed events from the Postgres DLQ table.
  """
  if x_admin_token != settings.ADMIN_SECRET_TOKEN:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid admin credentials"
    )

  from app.models.metadata import DeadLetterEvent

  pending_events = db.query(DeadLetterEvent).filter(DeadLetterEvent.status == "pending").all()
  replayed_count = 0
  failed_count = 0

  for dlq_event in pending_events:
    # Attempt republishing
    success = await kafka_manager.send_event(settings.KAFKA_TOPIC, dlq_event.payload)
    if success:
      dlq_event.status = "replayed"
      replayed_count += 1
    else:
      dlq_event.status = "failed"
      failed_count += 1

  db.commit()

  return {
    "status": "success",
    "replayed_count": replayed_count,
    "failed_count": failed_count,
    "total_scanned": len(pending_events)
  }
