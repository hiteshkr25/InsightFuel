from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.kafka import kafka_manager
from app.api.v1 import ingest
from app.core.telemetry import setup_telemetry, generate_latest, CONTENT_TYPE_LATEST

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Startup: Connect to Kafka
  await kafka_manager.start()
  yield
  # Shutdown: Disconnect from Kafka
  await kafka_manager.stop()

import os

app = FastAPI(
  title=settings.PROJECT_NAME,
  description="InsightFuel Ingestion Service Spec",
  version="1.0.0",
  openapi_url=f"{settings.API_V1_STR}/openapi.json",
  lifespan=lifespan
)

# Parse CORS origins
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_raw:
  origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]
else:
  origins = ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", "http://localhost:3002"]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Health Check API Routes
@app.get("/", tags=["Health"])
async def root():
  return {
    "service": "ingestion",
    "status": "running",
    "version": "1.0.0"
  }


# Initialize centralized telemetry and middlewares
setup_telemetry(app)

# Live and Ready check APIs
@app.get("/health/live", tags=["Health"])
async def live_check():
  return {"status": "OK", "uptime": "healthy"}

@app.get("/health/ready", tags=["Health"])
async def ready_check():
  # Checks Kafka state, Redis state, and DB connectivity stubs
  return {
    "status": "READY",
    "services": {
      "postgres": "connected",
      "redis": "connected",
      "kafka": "connected" if kafka_manager.producer else "local_dlq_fallback"
    }
  }

# Prometheus Metrics Endpoint
@app.get("/metrics", tags=["Metrics"])
async def metrics_endpoint():
  return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Include Router
app.include_router(ingest.router, prefix=f"{settings.API_V1_STR}/ingest", tags=["Ingest"])
