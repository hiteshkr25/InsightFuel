# InsightFuel Analytics Engine

The Analytics Engine computes session durations, cohort retentions, conversions, and traffic segments from ClickHouse raw event streams, saving metric rollups to analytical ClickHouse tables.

## Run Commands

1.  **Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Start Dev server:**
    ```bash
    uvicorn app.main:app --reload --port 3003
    ```

3.  **Run tests:**
    ```bash
    python -m pytest
    ```
