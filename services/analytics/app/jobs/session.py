import logging
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from app.core.clickhouse import clickhouse_manager

logger = logging.getLogger("insightfuel.analytics")

async def compute_session_metrics(start_time: str, end_time: str) -> int:
  """
  Loads events from ClickHouse between start_time and end_time,
  runs session metrics computations using Pandas, and saves rollups.
  """
  client = clickhouse_manager.get_client()
  if not client:
    logger.error("ClickHouse client offline. Session metrics computation aborted.")
    return 0

  # Query raw events
  query = """
    SELECT event_id, event_name, distinct_id, project_id, timestamp, received_at,
           browser, os, device, ip_address,
           JSONExtractString(context, 'session_id') as session_id
    FROM events
    WHERE received_at >= {start} AND received_at < {end}
  """
  
  try:
    res = client.query(query, parameters={"start": start_time, "end": end_time})
    if not res.result_rows:
      logger.info(f"No events found for session metrics rollup between {start_time} and {end_time}")
      return 0

    # Load into Pandas DataFrame
    df = pd.DataFrame(res.result_rows, columns=res.column_names)
    if df.empty or "session_id" not in df:
      return 0

    # Clean empty session IDs
    df = df[df["session_id"] != ""]
    if df.empty:
      return 0

    # Convert timestamps to datetimes
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    session_rows = []
    # Group by project_id and session_id
    grouped = df.groupby(["project_id", "session_id"])

    for (project_id, session_id), group in grouped:
      sorted_group = group.sort_values("timestamp")
      first_event = sorted_group.iloc[0]
      last_event = sorted_group.iloc[-1]

      duration = (last_event["timestamp"] - first_event["timestamp"]).total_seconds()
      
      # Compute active time: sum of diffs between consecutive events if <= 5 minutes (300s)
      time_diffs = sorted_group["timestamp"].diff().dt.total_seconds().dropna()
      active_time = time_diffs[time_diffs <= 300].sum()
      if active_time == 0 and len(group) > 0:
        active_time = 1.0  # Min active session time

      idle_time = max(0.0, duration - active_time)

      # Quality Score: computed based on action count and active time
      actions_count = len(group)
      quality_score = min(10.0, float(actions_count * 0.5 + active_time * 0.01))

      session_rows.append((
        session_id,
        project_id,
        float(duration),
        float(active_time),
        float(idle_time),
        float(quality_score),
        first_event["device"] or "unknown",
        first_event["browser"] or "unknown",
        first_event["os"] or "unknown",
        "unknown",  # Country placeholder (parsed if available)
        first_event["timestamp"].to_pydatetime()
      ))

    # Bulk insert computed session metrics into ClickHouse
    columns = [
      "session_id", "project_id", "duration", "active_time", "idle_time", "quality_score",
      "device", "browser", "os", "country", "timestamp"
    ]
    client.insert("session_metrics", session_rows, column_names=columns)
    logger.info(f"Processed session metrics for {len(session_rows)} sessions.")
    return len(session_rows)
  except Exception as e:
    logger.error(f"Error computing session metrics: {e}")
    raise e
