import http from 'k6/http';
import { check, sleep } from 'k6';

// Read active profile configuration from environment variables
const PROFILE = __ENV.LOAD_PROFILE || 'default';

let stages = [
  { duration: '30s', target: 10 },
  { duration: '1m', target: 30 },
  { duration: '30s', target: 0 }
];

if (PROFILE === 'ingestion') {
  // High throughput ingestion profile (stress testing gateway endpoint)
  stages = [
    { duration: '15s', target: 50 },
    { duration: '1m', target: 150 },
    { duration: '15s', target: 0 }
  ];
} else if (PROFILE === 'analytics') {
  // Complex analytics query profile
  stages = [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 }
  ];
}

export const options = {
  stages: stages,
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Errors must stay below 1%
    http_req_duration: ['p(95)<500']  // 95% of queries must finish under 500ms
  }
};

const BASE_URL = 'http://localhost:3004/api/v1';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer test_jwt_load_testing_token'
};

export default function () {
  if (PROFILE === 'ingestion') {
    // 1. Ingestion endpoint stress
    const payload = JSON.stringify({
      event_type: 'page_view',
      project_id: 'proj_123',
      session_id: 'sess_9f02b1',
      properties: { path: '/home' }
    });
    const res = http.post('http://localhost:3001/api/v1/events', payload, { headers: { 'Content-Type': 'application/json' } });
    check(res, { 'ingestion status is 202': (r) => r.status === 202 });
    sleep(0.1);
  } else if (PROFILE === 'analytics') {
    // 2. Complex queries load
    const funnelsRes = http.get(`${BASE_URL}/users/funnels?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13`, { headers: HEADERS });
    check(funnelsRes, { 'funnels query status is 200': (r) => r.status === 200 });
    
    const retentionRes = http.get(`${BASE_URL}/users/retention?project_id=proj_123&start_date=2026-07-10&end_date=2026-07-13`, { headers: HEADERS });
    check(retentionRes, { 'retention query status is 200': (r) => r.status === 200 });
    sleep(0.5);
  } else {
    // Default smoke checks
    const healthRes = http.get('http://localhost:3004/health/live');
    check(healthRes, { 'health status is 200': (r) => r.status === 200 });
    sleep(1);
  }
}
