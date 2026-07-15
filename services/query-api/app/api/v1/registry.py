from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import validate_jwt_and_project_access, check_rate_limits
from app.schemas.metrics import METRIC_REGISTRY

router = APIRouter()

@router.get("/registry", dependencies=[Depends(check_rate_limits)])
async def get_metrics_registry(
  jwt_payload = Depends(validate_jwt_and_project_access)
):
  """
  Exposes the canonical Metric Registry to dashboard clients.
  """
  return METRIC_REGISTRY
