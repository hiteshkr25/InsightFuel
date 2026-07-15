# InsightFuel Query API

The Query API is the canonical read layer of InsightFuel. Every downstream service (Dashboard, Power BI, AI Engine, Feature Intelligence, Product Health) consumes analytics through this read-only FastAPI service instead of querying ClickHouse directly.

## Execution

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Start API server:**
    ```bash
    uvicorn app.main:app --reload --port 3004
    ```

3.  **Run tests:**
    ```bash
    python -m pytest
    ```
