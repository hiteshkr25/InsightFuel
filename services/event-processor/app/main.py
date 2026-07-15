import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Header, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaProducer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.telemetry import setup_telemetry, generate_latest, CONTENT_TYPE_LATEST
from app.pipeline.worker import worker_manager

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

async def publish_to_kafka(topic: str, value: dict) -> bool:
  """
  Helper to push replayed events back into the primary Kafka raw events topic.
  """
  producer = AIOKafkaProducer(bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS)
  try:
    await producer.start()
    payload = json.dumps(value).encode('utf-8')
    await producer.send_and_wait(topic, payload)
    return True
  except Exception:
    return False
  finally:
    await producer.stop()

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Startup background workers
  await worker_manager.start()
  yield
  # Stop background workers on shutdown
  await worker_manager.stop()

app = FastAPI(
  title=settings.PROJECT_NAME,
  description="InsightFuel Event Processor Pipeline Worker Service",
  version="1.0.0",
  openapi_url=f"{settings.API_V1_STR}/openapi.json",
  lifespan=lifespan
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

setup_telemetry(app)

@app.get("/health/live", tags=["Health"])
async def live_check():
  return {"status": "OK", "uptime": "healthy"}

@app.get("/health/ready", tags=["Health"])
async def ready_check():
  return {
    "status": "READY",
    "services": {
      "postgres": "connected",
      "redis": "connected",
      "kafka_consumer": "connected" if kafka_consumer_manager.consumer else "disconnected"
    }
  }

@app.get("/metrics", tags=["Metrics"])
async def metrics_endpoint():
  return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post(f"{settings.API_V1_STR}/event-processor/admin/dlq/replay", status_code=status.HTTP_200_OK, tags=["Admin"])
async def replay_dlq_events(
  x_admin_token: str = Header(...),
  db: Session = Depends(get_db)
):
  """
  Admin route to replay failed events from the Postgres DLQ table back to Kafka.
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
    # Publish back to ingest queue
    success = await publish_to_kafka(settings.KAFKA_TOPIC, dlq_event.payload)
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
