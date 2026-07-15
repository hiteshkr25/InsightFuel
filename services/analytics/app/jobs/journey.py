import logging
from datetime import datetime, timezone, timedelta
import pandas as pd
from app.core.clickhouse import clickhouse_manager

logger = logging.getLogger("insightfuel.analytics")

async def compute_journey_analytics(target_date: str) -> int:
  """
  Calculates page-to-page transition paths for sessions active on target_date.
  """
  client = clickhouse_manager.get_client()
  if not client:
    return 0

  dt_target = datetime.fromisoformat(target_date.replace("Z", "+00:00")).date()
  
  query = """
    SELECT project_id, timestamp, JSONExtractString(context, 'session_id') as session_id,
           JSONExtractString(properties, 'path') as path
    FROM events
    WHERE event_name = 'page_view' AND timestamp >= {start} AND timestamp < {end}
  """
  
  start_day = datetime.combine(dt_target, datetime.min.time(), timezone.utc)
  end_day = datetime.combine(dt_target + timedelta(days=1), datetime.min.time(), timezone.utc)

  try:
    res = client.query(query, parameters={"start": start_day, "end": end_day})
    if not res.result_rows:
      logger.info(f"No page views found for journey analytics on {target_date}")
      return 0

    df = pd.DataFrame(res.result_rows, columns=res.column_names)
    df = df[df["session_id"] != ""]
    df = df[df["path"] != ""]
    if df.empty:
      return 0

    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values(["session_id", "timestamp"])

    # Shift target path within each session group
    df["source_path"] = df["path"]
    df["target_path"] = df.groupby("session_id")["path"].shift(-1)

    # Drop last pages of sessions since they don't lead anywhere
    df = df.dropna(subset=["target_path"])
    if df.empty:
      return 0

    # Group transitions by project_id, source_path, and target_path
    transitions = df.groupby(["project_id", "source_path", "target_path"]).size().reset_index(name="count")
    
    path_rows = []
    for _, row in transitions.iterrows():
      path_rows.append((
        row["project_id"],
        row["source_path"],
        row["target_path"],
        int(row["count"]),
        datetime.combine(dt_target, datetime.min.time(), timezone.utc)
      ))

    if path_rows:
      columns = ["project_id", "source_path", "target_path", "transition_count", "timestamp"]
      client.insert("path_metrics", path_rows, column_names=columns)

    return len(path_rows)
  except Exception as e:
    logger.error(f"Error computing journey analytics: {e}")
    raise e
