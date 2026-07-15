# InsightFuel API Gateway & BFF (FastAPI)

This is the FastAPI backend application providing authentication, multi-tenant workspace configurations, RBAC, project management, and audit logs.

## Setup & Running Locally

1.  **Create a Virtual Environment:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    source venv/bin/activate  # macOS/Linux
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run Development Server:**
    ```bash
    uvicorn app.main:app --reload --port 3000
    ```

4.  **API Documentation:**
    Visit `http://localhost:3000/docs` to access the interactive Swagger OpenAPI docs.

5.  **Execute Tests:**
    ```bash
    pytest
    ```
