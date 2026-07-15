# InsightFuel Product Health Engine

The Product Health Engine aggregates platform performance, reliability, retention, and feature intelligence metrics to calculate a multi-dimension weighted Product Health Score and Maturity Classification.

## Run Commands

1.  **Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Start API server:**
    ```bash
    uvicorn app.main:app --reload --port 3006
    ```

3.  **Run tests:**
    ```bash
    python -m pytest
    ```
