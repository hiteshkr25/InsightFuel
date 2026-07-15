import logging
from datetime import datetime, timezone, timedelta
import pandas as pd
from app.core.clickhouse import clickhouse_manager

logger = logging.getLogger("insightfuel.analytics")

async def compute_feature_analytics(start_time: str, end_time: str) -> int:
  """
  Computes unique feature usage metrics.
  """
  client = clickhouse_manager.get_client()
  if not client:
    return 0

  query = """
    SELECT project_id, distinct_id, timestamp,
           JSONExtractString(properties, 'selector') as feature_id
    FROM events
    WHERE event_name = 'click' AND received_at >= {start} AND received_at < {end}
  """

  try:
    res = client.query(query, parameters={"start": start_time, "end": end_time})
    if not res.result_rows:
      return 0

    df = pd.DataFrame(res.result_rows, columns=res.column_names)
    df = df[df["feature_id"] != ""]
    if df.empty:
      return 0

    # Group by project_id and feature_id
    grouped = df.groupby(["project_id", "feature_id"])
    feature_rows = []

    for (project_id, feature_id), group in grouped:
      usage_count = len(group)
      unique_users = len(group["distinct_id"].unique())
      avg_time = 0.5  # Mock/placeholder feature session time (computed relative to scroll/dwell times)
      
      feature_rows.append((
        project_id,
        feature_id,
        int(usage_count),
        int(unique_users),
        float(avg_time),
        datetime.now(timezone.utc)
      ))

    if feature_rows:
      columns = ["project_id", "feature_id", "usage_count", "unique_users", "avg_time_spent", "timestamp"]
      client.insert("feature_metrics", feature_rows, column_names=columns)

    return len(feature_rows)
  except Exception as e:
    logger.error(f"Error computing feature metrics: {e}")
    raise e

async def compute_performance_analytics(start_time: str, end_time: str) -> int:
  """
  Aggregates load times, API latencies, and JavaScript exception rates.
  """
  client = clickhouse_manager.get_client()
  if not client:
    return 0

  # Query load performances and exceptions
  query = """
    SELECT project_id, event_name, timestamp,
           JSONExtractFloat(properties, 'ttfb') as ttfb,
           JSONExtractFloat(properties, 'dom_complete') as dom_complete
    FROM events
    WHERE (event_name = 'performance_load' OR event_name = 'exception')
      AND received_at >= {start} AND received_at < {end}
  """

  try:
    res = client.query(query, parameters={"start": start_time, "end": end_time})
    if not res.result_rows:
      return 0

    df = pd.DataFrame(res.result_rows, columns=res.column_names)
    
    # Split load and exceptions
    load_df = df[df["event_name"] == "performance_load"]
    exc_df = df[df["event_name"] == "exception"]

    projects = df["project_id"].unique()
    perf_rows = []

    for project_id in projects:
      p_load = load_df[load_df["project_id"] == project_id]
      p_exc = exc_df[exc_df["project_id"] == project_id]

      avg_load = float(p_load["dom_complete"].mean()) if not p_load.empty else 0.0
      avg_latency = float(p_load["ttfb"].mean()) if not p_load.empty else 0.0
      error_count = len(p_exc)

      perf_rows.append((
        project_id,
        datetime.now(timezone.utc),
        avg_load,
        avg_latency,
        int(error_count)
      ))

    if perf_rows:
      columns = ["project_id", "timestamp", "avg_load_time", "avg_api_latency", "error_count"]
      client.insert("performance_metrics", perf_rows, column_names=columns)

    return len(perf_rows)
  except Exception as e:
    logger.error(f"Error computing performance metrics: {e}")
    raise e
