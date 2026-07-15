from typing import List, Dict, Any

def evaluate(data: Dict[str, Any]) -> List[Dict[str, Any]]:
  results = []
  growing = data.get("growing_features", [])
  declining = data.get("declining_features", [])

  if growing:
    top = growing[0]
    results.append({
      "template_id": "FEATURE_GROWTH",
      "metrics_used": ["growth_rate_wow"],
      "evidence": {
        "feature_id": top.get("feature_id"),
        "growth_rate": float(top.get("growth_rate_wow", 0.0))
      }
    })

  if declining:
    top = declining[0]
    results.append({
      "template_id": "DECLINING_FEATURE",
      "metrics_used": ["growth_rate_wow"],
      "evidence": {
        "feature_id": top.get("feature_id"),
        "decline_rate": float(top.get("growth_rate_wow", 0.0))
      }
    })

  return results
