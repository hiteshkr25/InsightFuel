from typing import Dict, Any

def compute_priority_score(
  severity: str,
  overall_confidence: float,
  business_impact: float = 5.0,
  urgency: float = 1.0,
  affected_users: float = 1.0
) -> float:
  """
  Calculates the priority rank score:
  Priority Score = Severity Weight * Business Impact * Overall Confidence * Urgency * Affected Users
  """
  # Severity mapping
  sev_map = {
    "critical": 3.0,
    "warning": 2.0,
    "info": 1.0
  }
  sev_weight = sev_map.get(severity.lower(), 1.0)
  
  # Adjust urgency based on severity
  if severity.lower() == "critical":
    urgency = 2.0
    
  score = float(sev_weight * business_impact * overall_confidence * urgency * affected_users)
  return round(score, 2)
