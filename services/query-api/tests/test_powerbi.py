from fastapi.testclient import TestClient

def test_list_workspaces_and_reports(client: TestClient):
  # 1. Get workspaces
  resp = client.get("/api/v1/powerbi/workspaces")
  assert resp.status_code == 200
  workspaces = resp.json()
  assert len(workspaces) > 0
  assert workspaces[0]["id"] == "ws_finance_exec"

  # 2. Get reports
  resp = client.get("/api/v1/powerbi/reports?workspace_id=ws_finance_exec")
  assert resp.status_code == 200
  reports = resp.json()
  assert len(reports) > 0
  assert reports[0]["report_id"] == "rep_revenue_quarter"

def test_embed_token_rls(client: TestClient):
  payload = {
    "workspace_id": "ws_finance_exec",
    "report_id": "rep_revenue_quarter",
    "project_id": "proj_123",
    "org_id": "org_123"
  }
  resp = client.post("/api/v1/powerbi/embed-token", json=payload)
  assert resp.status_code == 200
  data = resp.json()
  
  assert "embed_token" in data
  assert data["report_id"] == "rep_revenue_quarter"
  assert "rls_active" in data
  assert data["rls_active"]["username"] == "org_123:proj_123"
  assert "Viewer" in data["rls_active"]["roles"]
