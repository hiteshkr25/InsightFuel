from typing import List, Dict, Any
from app.registry.recommendation_registry import RECOMMENDATION_REGISTRY

def evaluate(data: Dict[str, Any]) -> List[Dict[str, Any]]:
  results = []
  health = data.get("health", {})
  if not health:
    return results

  adopt_score = health.get("score_feature_adoption", 100.0)
  threshold = RECOMMENDATION_REGISTRY["LOW_ADOPTION"]["thresholds"]["score_feature_adoption"]
  
  if adopt_score < threshold:
    results.append({
      "template_id": "LOW_ADOPTION",
      "metrics_used": ["score_feature_adoption"],
      "evidence": {
        "current_adoption": float(adopt_score),
        "threshold": float(threshold)
      }
    })
  return results
