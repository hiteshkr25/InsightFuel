import json
import hashlib
import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from fastapi.responses import StreamingResponse
from app.api.deps import validate_jwt_and_project_access, check_rate_limits, get_redis
from app.repositories.analytics_repository import analytics_repository
from app.core.redis import get_cached_query, set_cached_query

router = APIRouter()

def serialize_to_csv(data: list) -> StreamingResponse:
  output = io.StringIO()
  if not data:
    return StreamingResponse(io.StringIO(""), media_type="text/csv")
  writer = csv.DictWriter(output, fieldnames=data[0].keys())
  writer.writeheader()
  writer.writerows(data)
  output.seek(0)
  return StreamingResponse(
    io.StringIO(output.getvalue()),
    media_type="text/csv",
    headers={"Content-Disposition": "attachment; filename=sessions_metrics.csv"}
  )

@router.get("/sessions", dependencies=[Depends(check_rate_limits)])
async def get_sessions(
  project_id: str = Query(...),
  start_date: str = Query(...),
  end_date: str = Query(...),
  browser: Optional[str] = Query(None),
  device: Optional[str] = Query(None),
  country: Optional[str] = Query(None),
  limit: int = Query(100, ge=1, le=1000),
  offset: int = Query(0, ge=0),
  format: str = Query("json"),
  redis_client = Depends(get_redis),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  # 1. Enforce Tenant Isolation
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  # 2. Caching check
  filters = {"browser": browser, "device": device, "country": country}
  filter_str = json.dumps(filters, sort_keys=True)
  query_key = f"qcache:{project_id}:sessions:{start_date}:{end_date}:{filter_str}:{limit}:{offset}:{format}"
  
  cached = await get_cached_query(redis_client, query_key)
  if cached:
    if format == "csv":
      return Response(content=cached, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=sessions_metrics.csv"})
    return Response(content=cached, media_type="application/json")

  # 3. Query clickhouse repository
  data = analytics_repository.get_session_metrics(
    project_id, start_date, end_date, filters, limit, offset
  )

  # 4. Format and cache writeback
  if format == "csv":
    output = io.StringIO()
    if data:
      writer = csv.DictWriter(output, fieldnames=data[0].keys())
      writer.writeheader()
      writer.writerows(data)
    csv_str = output.getvalue()
    await set_cached_query(redis_client, query_key, csv_str, ttl=300)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=sessions_metrics.csv"})

  json_str = json.dumps(data, default=str)
  await set_cached_query(redis_client, query_key, json_str, ttl=300)
  return Response(content=json_str, media_type="application/json")
