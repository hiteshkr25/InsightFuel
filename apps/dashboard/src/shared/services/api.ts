import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

const QUERY_API_BASE = import.meta.env.VITE_QUERY_API_URL || 'http://localhost:3004';
const FEATURE_INTEL_BASE = import.meta.env.VITE_FEATURE_INTELLIGENCE_URL || 'http://localhost:3005';
const PRODUCT_HEALTH_BASE = import.meta.env.VITE_PRODUCT_HEALTH_URL || 'http://localhost:3006';
const AI_ENGINE_BASE = import.meta.env.VITE_AI_ENGINE_URL || 'http://localhost:3007';

// Controlled strictly by environment variables setup
const IS_MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === 'true';


const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// High-fidelity fallback templates for fallback development mode
const MOCK_SESSIONS = [
  { session_id: 's_9f2a', duration: 254, active_time: 198, idle_time: 56, quality_score: 8.4, device: 'Desktop', browser: 'Chrome', os: 'Windows', country: 'US', timestamp: '2026-07-14T11:10:00Z' },
  { session_id: 's_4b1c', duration: 180, active_time: 160, idle_time: 20, quality_score: 7.2, device: 'Mobile', browser: 'Safari', os: 'iOS', country: 'GB', timestamp: '2026-07-14T11:12:00Z' }
];

const MOCK_ACTIVITY = [
  { timestamp: '2026-07-10', dau: 1200, wau: 4500, mau: 14000, new_users: 150, returning_users: 1050 },
  { timestamp: '2026-07-11', dau: 1250, wau: 4600, mau: 14200, new_users: 180, returning_users: 1070 },
  { timestamp: '2026-07-12', dau: 1300, wau: 4700, mau: 14500, new_users: 160, returning_users: 1140 },
  { timestamp: '2026-07-13', dau: 1280, wau: 4650, mau: 14400, new_users: 145, returning_users: 1135 },
  { timestamp: '2026-07-14', dau: 1350, wau: 4800, mau: 14800, new_users: 190, returning_users: 1160 }
];

const MOCK_FUNNELS = [
  { funnel_id: 'checkout', step_number: 1, step_name: 'Page View', completed_users: 500, dropoff_rate: 0.0, conversion_rate: 1.0, avg_completion_time: 0.0 },
  { funnel_id: 'checkout', step_number: 2, step_name: 'Add To Cart', completed_users: 380, dropoff_rate: 0.24, conversion_rate: 0.76, avg_completion_time: 12.4 },
  { funnel_id: 'checkout', step_number: 3, step_name: 'Submit Checkout', completed_users: 210, dropoff_rate: 0.44, conversion_rate: 0.42, avg_completion_time: 84.6 }
];

const MOCK_RETENTION = [
  { cohort_date: 'Week 1', day_number: 0, cohort_size: 100, retained_users: 100, retention_rate: 1.0 },
  { cohort_date: 'Week 1', day_number: 1, cohort_size: 100, retained_users: 82, retention_rate: 0.82 },
  { cohort_date: 'Week 1', day_number: 7, cohort_size: 100, retained_users: 54, retention_rate: 0.54 }
];

const MOCK_JOURNEYS = [
  { source_path: '/home', target_path: '/pricing', transition_count: 320 },
  { source_path: '/pricing', target_path: '/checkout', transition_count: 145 }
];

const MOCK_PERFORMANCE = [
  { timestamp: '2026-07-14', avg_load_time: 1.84, avg_api_latency: 0.22, error_count: 4 }
];

const MOCK_RANKINGS = [
  { feature_id: 'btn_checkout', adoption_rate: 0.74, usage_frequency: 3.2, growth_rate_wow: 0.22, stickiness_score: 0.74, importance_score: 2.45, health_status: 'growing', explanation: 'Active usage grown by WoW velocity rate of 22.0%' }
];

const MOCK_HEALTH = {
  health_score: 76.4,
  health_category: 'Healthy',
  maturity_stage: 'Growing',
  maturity_reason: 'Steady user base with healthy week-over-week user growth rate.',
  confidence_score: 1.0,
  score_acquisition: 82.5,
  score_activation: 78.0,
  score_engagement: 74.0,
  score_retention: 78.5,
  score_feature_adoption: 68.0,
  score_performance: 82.0,
  score_reliability: 91.2,
  score_user_experience: 78.0
};

const MOCK_RECS = [
  {
    id: 'r_01',
    title: 'App Reliability Degrading Below Alert Threshold',
    description: 'Product stability index dropped to 62.0% due to rising JS error and crash rates.',
    category: 'Reliability',
    severity: 'critical',
    overall_confidence: 0.95,
    priority_score: 25.6,
    metrics_used: ['score_reliability'],
    evidence: {
      explanation: 'Product reliability score of 62.0% dropped below the target threshold of 70.0%.'
    },
    suggested_action: 'Inspect the developer error trace list to debug top uncaught exceptions.',
    expected_impact: 'Minimize user friction and stabilize workflow conversions.',
    status: 'Generated',
    created_at: '2026-07-14T09:12:00Z'
  }
];

export const api = {
  getSessions: async (projectId: string, startDate: string, endDate: string) => {
    if (IS_MOCK_MODE) return MOCK_SESSIONS;
    const resp = await axios.get(`${QUERY_API_BASE}/api/v1/sessions`, {
      params: { project_id: projectId, start_date: startDate, end_date: endDate },
      headers: getHeaders()
    });
    return resp.data;
  },

  getUserActivity: async (projectId: string, startDate: string, endDate: string) => {
    if (IS_MOCK_MODE) return MOCK_ACTIVITY;
    const resp = await axios.get(`${QUERY_API_BASE}/api/v1/users/activity`, {
      params: { project_id: projectId, start_date: startDate, end_date: endDate },
      headers: getHeaders()
    });
    return resp.data;
  },

  getFunnels: async (projectId: string, startDate: string, endDate: string) => {
    if (IS_MOCK_MODE) return MOCK_FUNNELS;
    const resp = await axios.get(`${QUERY_API_BASE}/api/v1/users/funnels`, {
      params: { project_id: projectId, start_date: startDate, end_date: endDate },
      headers: getHeaders()
    });
    return resp.data;
  },

  getRetention: async (projectId: string, startDate: string, endDate: string) => {
    if (IS_MOCK_MODE) return MOCK_RETENTION;
    const resp = await axios.get(`${QUERY_API_BASE}/api/v1/users/retention`, {
      params: { project_id: projectId, start_date: startDate, end_date: endDate },
      headers: getHeaders()
    });
    return resp.data;
  },

  getJourneys: async (projectId: string, startDate: string, endDate: string) => {
    if (IS_MOCK_MODE) return MOCK_JOURNEYS;
    const resp = await axios.get(`${QUERY_API_BASE}/api/v1/journeys/paths`, {
      params: { project_id: projectId, start_date: startDate, end_date: endDate },
      headers: getHeaders()
    });
    return resp.data;
  },

  getPerformance: async (projectId: string, startDate: string, endDate: string) => {
    if (IS_MOCK_MODE) return MOCK_PERFORMANCE;
    const resp = await axios.get(`${QUERY_API_BASE}/api/v1/features/performance`, {
      params: { project_id: projectId, start_date: startDate, end_date: endDate },
      headers: getHeaders()
    });
    return resp.data;
  },

  getFeatureRankings: async (projectId: string) => {
    if (IS_MOCK_MODE) return MOCK_RANKINGS;
    const resp = await axios.get(`${FEATURE_INTEL_BASE}/api/v1/intelligence/rankings`, {
      params: { project_id: projectId, sort_by: 'importance' },
      headers: getHeaders()
    });
    return resp.data;
  },

  getProductHealth: async (projectId: string) => {
    if (IS_MOCK_MODE) return MOCK_HEALTH;
    const resp = await axios.get(`${PRODUCT_HEALTH_BASE}/api/v1/health/status`, {
      params: { project_id: projectId },
      headers: getHeaders()
    });
    return resp.data;
  },

  getRecommendations: async (projectId: string) => {
    if (IS_MOCK_MODE) return MOCK_RECS;
    const resp = await axios.get(`${AI_ENGINE_BASE}/api/v1/recommendations/active`, {
      params: { project_id: projectId },
      headers: getHeaders()
    });
    return resp.data;
  },

  updateRecommendationStatus: async (recId: string, projectId: string, status: string) => {
    if (IS_MOCK_MODE) return { id: recId, status };
    const resp = await axios.post(`${AI_ENGINE_BASE}/api/v1/recommendations/${recId}/lifecycle`, 
      { status },
      {
        params: { project_id: projectId },
        headers: getHeaders()
      }
    );
    return resp.data;
  }
};
