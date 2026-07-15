import time
import jwt
import asyncio
import logging
from typing import List, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("insightfuel.ai-engine")

def generate_m2m_token() -> str:
  payload = {
    "org_id": "org_123",
    "sub": "ai_engine_m2m",
    "exp": int(time.time()) + 300
  }
  return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

class QueryApiClient:
  def __init__(self):
    self.base_url = settings.QUERY_API_URL

  async def _get(self, path: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
    token = generate_m2m_token()
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{self.base_url}{path}"
    
    backoff = 0.5
    for attempt in range(3):
      try:
        async with httpx.AsyncClient(timeout=5.0) as client:
          response = await client.get(url, params=params, headers=headers)
          if response.status_code == 200:
            return response.json()
          elif response.status_code == 429: # throttled
            await asyncio.sleep(backoff * 2)
          else:
            logger.error(f"Query API returned {response.status_code} for path {path}: {response.text}")
            break
      except Exception as e:
        logger.error(f"Attempt {attempt+1} failed to call Query API at {path}: {e}")
        await asyncio.sleep(backoff)
        backoff *= 2
    return []

  async def get_user_activity(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    return await self._get(
      "/api/v1/users/activity",
      {"project_id": project_id, "start_date": start_date, "end_date": end_date}
    )

  async def get_sessions(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    return await self._get(
      "/api/v1/sessions",
      {"project_id": project_id, "start_date": start_date, "end_date": end_date}
    )

  async def get_performance_metrics(self, project_id: str, start_date: str, end_date: str) -> List[Dict[str, Any]]:
    return await self._get(
      "/api/v1/features/performance",
      {"project_id": project_id, "start_date": start_date, "end_date": end_date}
    )

query_api_client = QueryApiClient()
