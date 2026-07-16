import sys
import os
import io

def test_routes():
    target_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "services", "feature-intelligence")
    sys.path.insert(0, target_path)
    
    # Temporarily redirect stdout to suppress exporter prints on import
    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    
    try:
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)
    finally:
        sys.stdout = old_stdout
        
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
            # Temporarily redirect stdout during HTTP requests to capture only output
            old_stdout = sys.stdout
            sys.stdout = io.StringIO()
            res = client.get(ep)
            sys.stdout = old_stdout
            print(f"Endpoint: {ep:<25} -> Status: {res.status_code:<5} -> Content: {res.text[:100]}")
        except Exception as e:
            sys.stdout = old_stdout
            print(f"Endpoint: {ep:<25} -> CRASHED: {e}")

if __name__ == "__main__":
    test_routes()
