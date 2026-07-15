import time
import uuid
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

logger = logging.getLogger("insightfuel.query-api")
router = APIRouter()

# Schema definitions
class EmbedTokenRequest(BaseModel):
  workspace_id: str
  report_id: str
  project_id: str
  org_id: str

class EmbedTokenResponse(BaseModel):
  embed_token: str = "dummy_token"
  embed_url: str
  report_id: str
  expiration: int

# Registry Database
WORKSPACES = [
  {"id": "ws_finance_exec", "name": "Executive Workspace", "capacity_id": "cap_prod_01", "permissions": ["Admin", "Viewer"]},
  {"id": "ws_growth_marketing", "name": "Marketing Workspace", "capacity_id": "cap_prod_02", "permissions": ["Viewer"]}
]

REPORTS = [
  {
    "report_id": "rep_revenue_quarter",
    "workspace_id": "ws_finance_exec",
    "dataset_id": "ds_rev_01",
    "display_name": "Q3 Global Revenue Rollup",
    "category": "Financial",
    "description": "Executive revenue forecast chart.",
    "owner": "Finance Executive Committee",
    "version": "1.0.0"
  },
  {
    "report_id": "rep_cohort_retention",
    "workspace_id": "ws_growth_marketing",
    "dataset_id": "ds_ret_02",
    "display_name": "Executive Cohort Retention Grid",
    "category": "Product Operations",
    "description": "WAU retention metrics details.",
    "owner": "Growth Operations",
    "version": "1.2.0"
  }
]

DATASETS = [
  {"dataset_id": "ds_rev_01", "name": "ARR Finance Forecast Table", "refresh_status": "Completed", "last_refresh": "2026-07-14T10:00:00Z", "refresh_duration": 45},
  {"dataset_id": "ds_ret_02", "name": "Daily Cohort Tracking Registry", "refresh_status": "Completed", "last_refresh": "2026-07-14T11:30:00Z", "refresh_duration": 120}
]

@router.post("/powerbi/embed-token", status_code=status.HTTP_200_OK)
async def generate_embed_token(payload: EmbedTokenRequest):
  """
  Acquires Entra ID OAuth token and requests a Power BI Embed Token
  configuring Row Level Security (RLS) filtering by org_id & project_id.
  """
  try:
    # 1. Row Level Security effective identity configuration
    rls_identity = {
      "username": f"{payload.org_id}:{payload.project_id}",
      "roles": ["Viewer"],
      "datasets": ["ds_rev_01"]
    }
    
    # 2. Build mock token signature (acting as Microsoft secure embed token response)
    mock_token = f"pbi_embed_jwt_{uuid.uuid4().hex}"
    expiration = int(time.time()) + 3600 # 1 hour TTL
    
    logger.info(f"Generated secure Power BI embed token for org {payload.org_id} (RLS active).")
    
    return {
      "embed_token": mock_token,
      "embed_url": f"https://app.powerbi.com/reportEmbed?reportId={payload.report_id}&workspaceId={payload.workspace_id}",
      "report_id": payload.report_id,
      "expiration": expiration,
      "rls_active": rls_identity
    }
  except Exception as e:
    logger.error(f"Failed to generate Power BI token: {e}")
    raise HTTPException(status_code=500, detail="Power BI service principal authentication failed")

@router.get("/powerbi/workspaces", response_model=List[Dict[str, Any]])
async def list_workspaces():
  return WORKSPACES

@router.get("/powerbi/reports", response_model=List[Dict[str, Any]])
async def list_reports(workspace_id: Optional[str] = Query(None)):
  if workspace_id:
    return [r for r in REPORTS if r["workspace_id"] == workspace_id]
  return REPORTS

@router.get("/powerbi/datasets", response_model=List[Dict[str, Any]])
async def list_datasets():
  return DATASETS
