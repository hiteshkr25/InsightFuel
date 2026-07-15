import urllib.request
import json
import sys

SERVICES = {
  "ingestion": "http://localhost:3001/health/live",
  "event-processor": "http://localhost:3002/health/live",
  "analytics": "http://localhost:3003/health/live",
  "query-api": "http://localhost:3004/health/live",
  "feature-intelligence": "http://localhost:3005/health/live",
  "product-health": "http://localhost:3006/health/live",
  "ai-engine": "http://localhost:3007/health/live"
}

def verify_service(name, url):
  try:
    with urllib.request.urlopen(url, timeout=3) as resp:
      if resp.status == 200:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"Service {name} is HEALTHY. Status: {data.get('status', 'OK')}")
        return True
      print(f"Service {name} returned HTTP status: {resp.status}")
      return False
  except Exception as e:
    print(f"Service {name} check failed: {e}")
    return False

def main():
  print("Executing production post-deployment smoke tests...")
  all_ok = True
  
  for name, url in SERVICES.items():
    if not verify_service(name, url):
      all_ok = False
      
  if not all_ok:
    print("Smoke tests FAILED. Halting deployment pipeline!")
    sys.exit(1)
    
  print("All smoke tests PASSED successfully.")
  sys.exit(0)

if __name__ == "__main__":
  main()
