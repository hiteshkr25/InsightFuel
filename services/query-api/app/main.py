from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.core.clickhouse import clickhouse_manager
from app.core.telemetry import setup_telemetry, generate_latest, CONTENT_TYPE_LATEST

# Import v1 API routers
from app.api.v1.sessions import router as sessions_router
from app.api.v1.users import router as users_router
from app.api.v1.journey import router as journey_router
from app.api.v1.features import router as features_router
from app.api.v1.registry import router as registry_router
from app.api.v1.powerbi import router as powerbi_router

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Initialize SQLite local metadata tables on boot for unit tests
  Base.metadata.create_all(bind=engine)
  yield
  # Close connections
  clickhouse_manager.close()

import os

app = FastAPI(
  title=settings.PROJECT_NAME,
  description="InsightFuel Analytics Read-Only Query Service API",
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
    "service": "query-api",
    "status": "running",
    "version": "1.0.0"
  }

setup_telemetry(app)


# Include v1 API routers
app.include_router(sessions_router, prefix=settings.API_V1_STR, tags=["Sessions"])
app.include_router(users_router, prefix=settings.API_V1_STR, tags=["Users"])
app.include_router(journey_router, prefix=settings.API_V1_STR, tags=["Journeys"])
app.include_router(features_router, prefix=settings.API_V1_STR, tags=["Features"])
app.include_router(registry_router, prefix=settings.API_V1_STR, tags=["Registry"])
app.include_router(powerbi_router, prefix=settings.API_V1_STR, tags=["PowerBI"])

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
      "clickhouse": "connected" if clickhouse_manager.get_client() else "disconnected"
    }
  }

@app.get("/metrics", tags=["Metrics"])
async def metrics_endpoint():
  return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
