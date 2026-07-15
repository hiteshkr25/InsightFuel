import json
import csv
import io
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from app.api.deps import validate_jwt_and_project_access, check_rate_limits, get_redis
from app.repositories.analytics_repository import analytics_repository
from app.core.redis import get_cached_query, set_cached_query

router = APIRouter()

@router.get("/users/activity", dependencies=[Depends(check_rate_limits)])
async def get_user_activity(
  project_id: str = Query(...),
  start_date: str = Query(...),
  end_date: str = Query(...),
  format: str = Query("json"),
  redis_client = Depends(get_redis),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  query_key = f"qcache:{project_id}:user_activity:{start_date}:{end_date}:{format}"
  cached = await get_cached_query(redis_client, query_key)
  if cached:
    if format == "csv":
      return Response(content=cached, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=user_activity.csv"})
    return Response(content=cached, media_type="application/json")

  data = analytics_repository.get_user_activity(project_id, start_date, end_date)

  if format == "csv":
    output = io.StringIO()
    if data:
      writer = csv.DictWriter(output, fieldnames=data[0].keys())
      writer.writeheader()
      writer.writerows(data)
    csv_str = output.getvalue()
    await set_cached_query(redis_client, query_key, csv_str, ttl=300)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=user_activity.csv"})

  json_str = json.dumps(data, default=str)
  await set_cached_query(redis_client, query_key, json_str, ttl=300)
  return Response(content=json_str, media_type="application/json")

@router.get("/users/retention", dependencies=[Depends(check_rate_limits)])
async def get_user_retention(
  project_id: str = Query(...),
  start_date: str = Query(...),
  end_date: str = Query(...),
  format: str = Query("json"),
  redis_client = Depends(get_redis),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  query_key = f"qcache:{project_id}:user_retention:{start_date}:{end_date}:{format}"
  cached = await get_cached_query(redis_client, query_key)
  if cached:
    if format == "csv":
      return Response(content=cached, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=user_retention.csv"})
    return Response(content=cached, media_type="application/json")

  data = analytics_repository.get_retention_metrics(project_id, start_date, end_date)

  if format == "csv":
    output = io.StringIO()
    if data:
      writer = csv.DictWriter(output, fieldnames=data[0].keys())
      writer.writeheader()
      writer.writerows(data)
    csv_str = output.getvalue()
    await set_cached_query(redis_client, query_key, csv_str, ttl=300)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=user_retention.csv"})

  json_str = json.dumps(data, default=str)
  await set_cached_query(redis_client, query_key, json_str, ttl=300)
  return Response(content=json_str, media_type="application/json")

@router.get("/users/funnels", dependencies=[Depends(check_rate_limits)])
async def get_funnels(
  project_id: str = Query(...),
  start_date: str = Query(...),
  end_date: str = Query(...),
  format: str = Query("json"),
  redis_client = Depends(get_redis),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  query_key = f"qcache:{project_id}:funnels:{start_date}:{end_date}:{format}"
  cached = await get_cached_query(redis_client, query_key)
  if cached:
    if format == "csv":
      return Response(content=cached, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=funnels.csv"})
    return Response(content=cached, media_type="application/json")

  data = analytics_repository.get_funnel_metrics(project_id, start_date, end_date)

  if format == "csv":
    output = io.StringIO()
    if data:
      writer = csv.DictWriter(output, fieldnames=data[0].keys())
      writer.writeheader()
      writer.writerows(data)
    csv_str = output.getvalue()
    await set_cached_query(redis_client, query_key, csv_str, ttl=300)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=funnels.csv"})

  json_str = json.dumps(data, default=str)
  await set_cached_query(redis_client, query_key, json_str, ttl=300)
  return Response(content=json_str, media_type="application/json")
