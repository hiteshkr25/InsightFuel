import urllib.request
import json
import os

SERVICES = {
  "ingestion": "http://localhost:3001",
  "event-processor": "http://localhost:3002",
  "analytics": "http://localhost:3003",
  "query-api": "http://localhost:3004",
  "feature-intelligence": "http://localhost:3005",
  "product-health": "http://localhost:3006",
  "ai-engine": "http://localhost:3007"
}

def query_endpoint(url):
  try:
    with urllib.request.urlopen(url, timeout=3) as resp:
      if resp.status == 200:
        return True, json.loads(resp.read().decode('utf-8'))
      return False, f"HTTP Status {resp.status}"
  except Exception as e:
    return False, str(e)

def main():
  print("Starting InsightFuel Platform Validation checks...")
  results = []
  
  for name, base_url in SERVICES.items():
    live_url = f"{base_url}/health/live"
    ready_url = f"{base_url}/health/ready"
    
    live_ok, live_data = query_endpoint(live_url)
    ready_ok, ready_data = query_endpoint(ready_url)
    
    results.append({
      "service": name,
      "live": "PASS" if live_ok else "FAIL",
      "ready": "PASS" if ready_ok else "FAIL",
      "details": ready_data if ready_ok else f"Connectivity failure: {ready_data}"
    })

  # Generate markdown report
  report_path = "docs/validation_report.md"
  os.makedirs(os.path.dirname(report_path), exist_ok=True)
  
  with open(report_path, "w") as f:
    f.write("# Platform Subsystems Validation Report\n\n")
    f.write("This report logs the automated health and connectivity validation checks.\n\n")
    f.write("| Subsystem Service | Live check | Ready check | Dependencies Status Details |\n")
    f.write("| :--- | :--- | :--- | :--- |\n")
    
    for r in results:
      f.write(f"| **{r['service']}** | {r['live']} | {r['ready']} | {r['details']} |\n")
      
  print(f"Validation checks complete. Report written to: {report_path}")

if __name__ == "__main__":
  main()
