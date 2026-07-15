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

class FeatureIntelClient:
  def __init__(self):
    self.base_url = settings.FEATURE_INTEL_URL

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
          elif response.status_code == 429:
            await asyncio.sleep(backoff * 2)
          else:
            logger.error(f"Feature Intel API returned {response.status_code} for path {path}: {response.text}")
            break
      except Exception as e:
        logger.error(f"Attempt {attempt+1} failed to call Feature Intel API at {path}: {e}")
        await asyncio.sleep(backoff)
        backoff *= 2
    return []

  async def get_feature_rankings(self, project_id: str, sort_by: str = "importance") -> List[Dict[str, Any]]:
    return await self._get(
      "/api/v1/intelligence/rankings",
      {"project_id": project_id, "sort_by": sort_by}
    )

  async def get_feature_trends(self, project_id: str, trend: str = "growing") -> List[Dict[str, Any]]:
    return await self._get(
      "/api/v1/intelligence/trends",
      {"project_id": project_id, "trend": trend}
    )

feature_intel_client = FeatureIntelClient()
