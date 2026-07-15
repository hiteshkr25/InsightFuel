import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List

logger = logging.getLogger("insightfuel.ai-engine")

def calculate_zscore_anomalies(activity: List[Dict[str, Any]]) -> Dict[str, Any]:
  """
  Checks daily active user logs using z-score indicators.
  """
  if not activity:
    return {}
    
  df = pd.DataFrame(activity)
  if "dau" not in df or len(df) < 3:
    return {}
    
  daus = df["dau"].astype(float).values
  mean_val = np.mean(daus)
  std_val = np.std(daus)
  
  if std_val <= 0:
    return {}
    
  current_val = daus[-1]
  z_score = (current_val - mean_val) / std_val
  
  return {
    "z_score": float(z_score),
    "current_dau": float(current_val),
    "historical_mean": float(mean_val),
    "deviation_std": float(std_val)
  }
