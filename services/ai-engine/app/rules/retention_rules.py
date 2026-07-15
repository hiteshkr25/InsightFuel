from typing import List, Dict, Any
from app.registry.recommendation_registry import RECOMMENDATION_REGISTRY

def evaluate(data: Dict[str, Any]) -> List[Dict[str, Any]]:
  results = []
  health = data.get("health", {})
  if not health:
    return results

  ret_score = health.get("score_retention", 100.0)
  threshold = RECOMMENDATION_REGISTRY["LOW_RETENTION"]["thresholds"]["score_retention"]
  
  if ret_score < threshold:
    results.append({
      "template_id": "LOW_RETENTION",
      "metrics_used": ["score_retention"],
      "evidence": {
        "current_retention": float(ret_score),
        "threshold": float(threshold)
      }
    })
  return results
