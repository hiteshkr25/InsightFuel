import json
import csv
import io
from fastapi import APIRouter, Depends, Query, HTTPException, Response
from app.api.deps import validate_jwt_and_project_access, check_rate_limits, get_redis
from app.repositories.analytics_repository import analytics_repository
from app.core.redis import get_cached_query, set_cached_query

router = APIRouter()

@router.get("/journeys/paths", dependencies=[Depends(check_rate_limits)])
async def get_journey_paths(
  project_id: str = Query(...),
  start_date: str = Query(...),
  end_date: str = Query(...),
  format: str = Query("json"),
  redis_client = Depends(get_redis),
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  if project_id != jwt_payload.get("project_id"):
    raise HTTPException(status_code=403, detail="Forbidden: Project scope mismatch")

  query_key = f"qcache:{project_id}:journeys:{start_date}:{end_date}:{format}"
  cached = await get_cached_query(redis_client, query_key)
  if cached:
    if format == "csv":
      return Response(content=cached, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=journey_paths.csv"})
    return Response(content=cached, media_type="application/json")

  data = analytics_repository.get_path_metrics(project_id, start_date, end_date)

  if format == "csv":
    output = io.StringIO()
    if data:
      writer = csv.DictWriter(output, fieldnames=data[0].keys())
      writer.writeheader()
      writer.writerows(data)
    csv_str = output.getvalue()
    await set_cached_query(redis_client, query_key, csv_str, ttl=300)
    return Response(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=journey_paths.csv"})

  json_str = json.dumps(data, default=str)
  await set_cached_query(redis_client, query_key, json_str, ttl=300)
  return Response(content=json_str, media_type="application/json")
