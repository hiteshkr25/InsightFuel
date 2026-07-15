# InsightFuel Feature Intelligence Engine

The Feature Intelligence Engine tracks element selector growth, stickiness, usage frequency, and scores lifecycle transition states (Discovered -> Candidate -> Tracked -> Deprecated). It pulls metrics exclusively from the Query API and records intelligence snapshots to PostgreSQL.

## Run Commands

1.  **Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Start API server:**
    ```bash
    uvicorn app.main:app --reload --port 3005
    ```

3.  **Run tests:**
    ```bash
    python -m pytest
    ```
