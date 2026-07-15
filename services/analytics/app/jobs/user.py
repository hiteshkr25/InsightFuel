import logging
from datetime import datetime, date, timezone, timedelta
import pandas as pd
import numpy as np
from app.core.clickhouse import clickhouse_manager

logger = logging.getLogger("insightfuel.analytics")

async def compute_user_analytics(target_date: str) -> int:
  """
  Calculates DAU, WAU, MAU, New and Returning Users for target_date.
  """
  client = clickhouse_manager.get_client()
  if not client:
    return 0

  dt_target = datetime.fromisoformat(target_date.replace("Z", "+00:00")).date()
  
  query = """
    SELECT distinct_id, project_id, timestamp
    FROM events
    WHERE timestamp >= {start} AND timestamp < {end}
  """
  
  # Fetch data for MAU (last 30 days) to construct rolling counts
  start_30 = datetime.combine(dt_target - timedelta(days=30), datetime.min.time(), timezone.utc)
  end_day = datetime.combine(dt_target + timedelta(days=1), datetime.min.time(), timezone.utc)

  try:
    res = client.query(query, parameters={"start": start_30, "end": end_day})
    if not res.result_rows:
      logger.info(f"No events found for user analytics on {target_date}")
      return 0

    df = pd.DataFrame(res.result_rows, columns=res.column_names)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["date"] = df["timestamp"].dt.date

    # Group by project
    projects = df["project_id"].unique()
    inserted_count = 0

    for project_id in projects:
      pdf = df[df["project_id"] == project_id]
      
      # 1. DAU: Unique users on target day
      dau_users = pdf[pdf["date"] == dt_target]["distinct_id"].unique()
      dau = len(dau_users)

      # 2. WAU: Unique users in last 7 days
      start_7_date = dt_target - timedelta(days=7)
      wau_users = pdf[(pdf["date"] >= start_7_date) & (pdf["date"] <= dt_target)]["distinct_id"].unique()
      wau = len(wau_users)

      # 3. MAU: Unique users in last 30 days
      mau_users = pdf["distinct_id"].unique()
      mau = len(mau_users)

      # 4. New Users: Find users whose first date in our dataset is target_date
      first_dates = pdf.groupby("distinct_id")["date"].min()
      new_users_list = first_dates[first_dates == dt_target].index.tolist()
      new_users = len(new_users_list)
      returning_users = max(0, dau - new_users)

      # Insert rollup metrics row
      metrics_row = [(
        project_id,
        datetime.combine(dt_target, datetime.min.time(), timezone.utc),
        int(dau),
        int(wau),
        int(mau),
        int(new_users),
        int(returning_users)
      )]
      
      columns = ["project_id", "timestamp", "dau", "wau", "mau", "new_users", "returning_users"]
      client.insert("user_activity_metrics", metrics_row, column_names=columns)
      inserted_count += 1

    return inserted_count
  except Exception as e:
    logger.error(f"Error computing user analytics: {e}")
    raise e

async def compute_retention_analytics(target_date: str) -> int:
  """
  Computes cohort retention statistics for users whose cohort date is target_date.
  Checks their return status 1, 7, and 30 days later.
  """
  client = clickhouse_manager.get_client()
  if not client:
    return 0

  dt_cohort = datetime.fromisoformat(target_date.replace("Z", "+00:00")).date()
  
  query = """
    SELECT distinct_id, project_id, timestamp
    FROM events
    WHERE timestamp >= {start}
  """
  
  # Fetch events from cohort start date to current day
  start_dt = datetime.combine(dt_cohort, datetime.min.time(), timezone.utc)
  try:
    res = client.query(query, parameters={"start": start_dt})
    if not res.result_rows:
      return 0

    df = pd.DataFrame(res.result_rows, columns=res.column_names)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["date"] = df["timestamp"].dt.date

    projects = df["project_id"].unique()
    retention_rows = []

    for project_id in projects:
      pdf = df[df["project_id"] == project_id]

      # Cohort size: unique users whose first event is on cohort_date
      first_dates = pdf.groupby("distinct_id")["date"].min()
      cohort_users = first_dates[first_dates == dt_cohort].index.tolist()
      cohort_size = len(cohort_users)
      
      if cohort_size == 0:
        continue

      # For days 1, 7, 30: calculate returning count
      for day_offset in [1, 7, 30]:
        check_date = dt_cohort + timedelta(days=day_offset)
        
        # Check if users returned on check_date
        returned_users = pdf[(pdf["distinct_id"].isin(cohort_users)) & (pdf["date"] == check_date)]["distinct_id"].unique()
        retained = len(returned_users)
        rate = float(retained / cohort_size) if cohort_size > 0 else 0.0

        retention_rows.append((
          project_id,
          dt_cohort,
          int(day_offset),
          int(cohort_size),
          int(retained),
          float(rate)
        ))

    if retention_rows:
      columns = ["project_id", "cohort_date", "day_number", "cohort_size", "retained_users", "retention_rate"]
      client.insert("retention_metrics", retention_rows, column_names=columns)
      
    return len(retention_rows)
  except Exception as e:
    logger.error(f"Error computing retention analytics: {e}")
    raise e

async def compute_funnel_analytics(target_date: str) -> int:
  """
  Processes conversion steps for default/mock funnels.
  Configured Funnel Steps:
  1. page_view (checkout landing) -> 2. click (add payment info) -> 3. form_submit (checkout complete)
  """
  client = clickhouse_manager.get_client()
  if not client:
    return 0

  dt_target = datetime.fromisoformat(target_date.replace("Z", "+00:00")).date()
  
  query = """
    SELECT distinct_id, project_id, event_name, timestamp
    FROM events
    WHERE timestamp >= {start} AND timestamp < {end}
  """
  
  start_day = datetime.combine(dt_target, datetime.min.time(), timezone.utc)
  end_day = datetime.combine(dt_target + timedelta(days=1), datetime.min.time(), timezone.utc)

  try:
    res = client.query(query, parameters={"start": start_day, "end": end_day})
    if not res.result_rows:
      return 0

    df = pd.DataFrame(res.result_rows, columns=res.column_names)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    projects = df["project_id"].unique()
    funnel_rows = []

    for project_id in projects:
      pdf = df[df["project_id"] == project_id]
      
      # Step 1: landing page views
      users_step1 = pdf[pdf["event_name"] == "page_view"]["distinct_id"].unique().tolist()
      count_step1 = len(users_step1)
      
      if count_step1 == 0:
        continue

      # Step 2: clicks from those users
      users_step2 = pdf[(pdf["distinct_id"].isin(users_step1)) & (pdf["event_name"] == "click")]["distinct_id"].unique().tolist()
      count_step2 = len(users_step2)

      # Step 3: form_submits from those users
      users_step3 = pdf[(pdf["distinct_id"].isin(users_step2)) & (pdf["event_name"] == "form_submit")]["distinct_id"].unique().tolist()
      count_step3 = len(users_step3)

      # Funnel definitions: conversion rates relative to step 1
      steps = [
        (1, "page_view", count_step1, 0.0, 1.0, 0.0),
        (2, "click", count_step2, float((count_step1 - count_step2) / count_step1), float(count_step2 / count_step1), 2.5),
        (3, "form_submit", count_step3, float((count_step2 - count_step3) / count_step2) if count_step2 > 0 else 1.0, float(count_step3 / count_step1), 10.2)
      ]

      for num, name, completed, dropoff, conv, elapsed in steps:
        funnel_rows.append((
          project_id,
          "checkout_funnel",
          int(num),
          name,
          int(completed),
          float(dropoff),
          float(conv),
          float(elapsed),
          datetime.combine(dt_target, datetime.min.time(), timezone.utc)
        ))

    if funnel_rows:
      columns = [
        "project_id", "funnel_id", "step_number", "step_name", "completed_users",
        "dropoff_rate", "conversion_rate", "avg_completion_time", "timestamp"
      ]
      client.insert("funnel_metrics", funnel_rows, column_names=columns)

    return len(funnel_rows)
  except Exception as e:
    logger.error(f"Error computing funnel analytics: {e}")
    raise e
