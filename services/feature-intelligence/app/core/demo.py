import os
from datetime import datetime, timedelta

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

def get_mock_sessions(project_id: str, limit: int = 100):
  now_str = datetime.now().isoformat()
  return [
    {
      "session_id": f"sess_demo_{project_id}_{i}",
      "duration": 300 + (i * 12) % 600,
      "active_time": 250 + (i * 12) % 500,
      "idle_time": 50 + (i * 12) % 100,
      "quality_score": 85 + (i % 15),
      "device": "mobile" if i % 3 == 0 else "pc",
      "browser": "Chrome" if i % 2 == 0 else "Safari",
      "os": "Windows" if i % 2 == 0 else "macOS",
      "country": "USA" if i % 4 == 0 else "Germany",
      "timestamp": now_str
    }
    for i in range(limit)
  ]

def get_mock_user_activity(project_id: str):
  today = datetime.now()
  return [
    {
      "timestamp": (today - timedelta(days=i)).strftime("%Y-%m-%d"),
      "dau": 1200 + (i * 73) % 400,
      "wau": 5400 + (i * 145) % 1200,
      "mau": 18000 + (i * 324) % 3000,
      "new_users": 150 + (i * 27) % 100,
      "returning_users": 1050 + (i * 54) % 300
    }
    for i in range(30)
  ]

def get_mock_features(project_id: str):
  return [
    {"feature_id": "feat_dashboard", "usage_count": 8500, "unique_users": 1200, "avg_time_spent": 120.5, "timestamp": datetime.now().isoformat()},
    {"feature_id": "feat_analytics", "usage_count": 4300, "unique_users": 950, "avg_time_spent": 240.2, "timestamp": datetime.now().isoformat()}
  ]
