# InsightFuel Event Processing Pipeline

High-throughput Python service orchestrating consumer worker threads to ingest events from Kafka/Redpanda, scrub PII, execute idempotency controls, and stream batches into the ClickHouse analytical store.

## CLI Commands

1.  **Virtual Environment:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate # Windows
    source venv/bin/activate # macOS/Linux
    ```

2.  **Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Local Execution:**
    ```bash
    uvicorn app.main:app --reload --port 3002
    ```

4.  **Unit Tests:**
    ```bash
    python -m pytest
    ```
