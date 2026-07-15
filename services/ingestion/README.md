# InsightFuel Event Ingestion Service

High-throughput, production-grade ingestion gateway written in FastAPI. It is responsible for validating client-side event batches, running schema/PII scrubbing checks, and publishing messages to the Redpanda/Kafka message queue.

## Local Development Setup

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
    uvicorn app.main:app --reload --port 3001
    ```

4.  **Interactive Docs:**
    Navigate to `http://localhost:3001/docs` for the Swagger API reference.

5.  **Run Tests:**
    ```bash
    python -m pytest
    ```
