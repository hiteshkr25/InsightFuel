# Feature Intelligence Runtime Deployment Audit Report

This report presents a runtime routing and middleware audit for the **Feature Intelligence** service to explain the root causes of previous HTTP `404` errors on Render and their resolution.

---

## 1. Issues Identified & Root Cause Analysis

During our runtime deployment audit, we identified two critical bugs in the FastAPI/Starlette startup and middleware registration cycle that prevented endpoints from resolving correctly:

### A. OpenTelemetry Instrumentation Order (FastAPIInstrumentor)
*   **Root Cause:** The `setup_telemetry(app)` utility was called *before* routers (e.g., `registry_router`, `intelligence_router`) and the prefix health endpoints were registered.
*   **Impact:** `FastAPIInstrumentor.instrument_app(app)` instruments the Starlette router by wrapping the routing functions inside trace wrappers. Because Starlette's routing stack was modified before these routers were appended, newer routes registered *after* instrumentation failed to map correctly within the telemetry-wrapped dispatcher, returning HTTP `404` at runtime.
*   **Fix:** Moved `setup_telemetry(app)` to the very end of the file in `services/feature-intelligence/app/main.py` and `services/ai-engine/app/main.py`, executing instrumentation only after all API routers, root path handlers, metrics endpoints, and health alias paths are completely attached.

### B. Prometheus Label Value Type Mismatches
*   **Root Cause:** Inside the `tracking_middleware` hook in `app/core/telemetry.py` of all microservices, the HTTP request count was tracked using:
    ```python
    HTTP_REQUEST_COUNT.labels(method=method, endpoint=endpoint, http_status=response.status_code).inc()
    ```
    The variable `response.status_code` evaluates to an `int` (e.g. `200`). Prometheus `labels(...)` strictly requires string arguments.
*   **Impact:** Under runtime conditions, this type mismatch threw a silent type/validation exception inside the ASGI middleware request loop. Instead of bubbling up as a standard traceback or returning `200`, the Starlette error catcher routed the request incorrectly or broke request resolution, appearing as an HTTP `404` (Not Found) or failing connections.
*   **Fix:** Stringified the status code using `str(response.status_code)` in the telemetry middleware of all microservices:
    *   `services/feature-intelligence/app/core/telemetry.py`
    *   `services/ai-engine/app/core/telemetry.py`
    *   `services/analytics/app/core/telemetry.py`
    *   `services/event-processor/app/core/telemetry.py`
    *   `services/ingestion/app/core/telemetry.py`
    *   `services/product-health/app/core/telemetry.py`
    *   `services/query-api/app/core/telemetry.py`

---

## 2. Complete Runtime Route Table

Below is the verified routing table for the **Feature Intelligence** service:

| Path | HTTP Methods | FastAPI Handler Name |
| :--- | :--- | :--- |
| `/` | `['GET']` | `root` |
| `/health/live` | `['GET']` | `live_check` |
| `/health/ready` | `['GET']` | `ready_check` |
| `/api/v1/health/live` | `['GET']` | `api_live_check` |
| `/api/v1/health/ready` | `['GET']` | `api_ready_check` |
| `/metrics` | `['GET']` | `metrics_endpoint` |
| `/docs` | `['GET', 'HEAD']` | `swagger_ui_html` |
| `/redoc` | `['GET', 'HEAD']` | `redoc_html` |
| `/api/v1/openapi.json` | `['GET', 'HEAD']` | `openapi` |
| `/api/v1/registry` | `['POST']` | `register_feature` |
| `/api/v1/registry` | `['GET']` | `list_registered_features` |
| `/api/v1/registry/{feature_id}/transition` | `['POST']` | `transition_feature_status` |
| `/api/v1/intelligence/snapshots` | `['GET']` | `list_snapshots` |
| `/api/v1/intelligence/rankings` | `['GET']` | `get_rankings` |
| `/api/v1/intelligence/trends` | `['GET']` | `get_trends` |
| `/api/v1/intelligence/compute` | `['POST']` | `trigger_intelligence_computation` |

---

## 3. Verification & Compliance Checklist

1.  **FastAPI Route Registration:** All routers are registered on the primary `app` instance. No redundant or duplicate FastAPI application objects exist.
2.  **No Blocking Middleware:** Telemetry middlewares do not block requests or prevent routing, and all type validations are fully resolved.
3.  **Render Health Compatibility:** Verified both `/` and `/health/live` respond with `200` without requiring API authorization keys.
