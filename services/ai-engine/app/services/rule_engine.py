import logging
from typing import List, Dict, Any

from app.rules import (
  adoption_rules,
  engagement_rules,
  performance_rules,
  retention_rules,
  feature_rules,
  health_rules
)

logger = logging.getLogger("insightfuel.ai-engine")

RULE_PACKS = [
  adoption_rules,
  engagement_rules,
  performance_rules,
  retention_rules,
  feature_rules,
  health_rules
]

def run_rule_engine(evaluation_data: Dict[str, Any]) -> List[Dict[str, Any]]:
  """
  Executes rule packs dynamically and consolidates raw trigger outputs.
  """
  triggers = []
  for pack in RULE_PACKS:
    try:
      triggers.extend(pack.evaluate(evaluation_data))
    except Exception as e:
      logger.error(f"Rule pack execution failure: {e}")
  return triggers
