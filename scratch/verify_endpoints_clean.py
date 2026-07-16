import sys
import os
import logging

def test_routes():
    # Silence telemetry exporters
    logging.getLogger().setLevel(logging.ERROR)
    os.environ["OTEL_TRACES_EXPORTER"] = "none"
    os.environ["OTEL_METRICS_EXPORTER"] = "none"
    
    target_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "services", "feature-intelligence")
    sys.path.insert(0, target_path)
    
    from fastapi.testclient import TestClient
    from app.main import app
    
    client = TestClient(app)
    
    endpoints = [
        "/",
        "/health/live",
        "/health/ready",
        "/api/v1/health/live",
        "/api/v1/health/ready",
        "/docs",
        "/openapi.json",
        "/api/v1/openapi.json"
    ]
    
    print("=== Request Verification ===")
    for ep in endpoints:
        try:
            res = client.get(ep)
            print(f"Endpoint: {ep:<25} -> Status: {res.status_code:<5} -> Content: {res.text[:100]}")
        except Exception as e:
            print(f"Endpoint: {ep:<25} -> CRASHED: {e}")

if __name__ == "__main__":
    test_routes()
