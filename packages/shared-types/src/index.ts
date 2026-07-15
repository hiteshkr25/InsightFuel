export interface EventEnvelope {
  event_id: string;
  event_name: string;
  category: 'navigation' | 'feature' | 'session' | 'performance' | 'error' | 'business' | 'system' | 'user' | 'custom';
  distinct_id: string;
  project_id: string;
  timestamp: string;
  properties?: Record<string, any>;
  properties_num?: Record<string, number>;
  context?: {
    url?: string;
    referrer?: string;
    browser?: string;
    os?: string;
    device?: string;
    timezone?: string;
    viewport_width?: number;
    viewport_height?: number;
    screen_width?: number;
    screen_height?: number;
    connection_type?: string;
    language?: string;
    platform?: string;
    session_id?: string;
  };
}

export interface UserAlias {
  anonymous_id: string;
  identified_id: string;
  project_id: string;
  created_at: string;
}

export interface FeatureRegistryEntry {
  technical_name: string;
  display_name: string;
  description?: string;
  category: string;
  status: 'Discovered' | 'Candidate' | 'Pending Approval' | 'Tracked' | 'Deprecated' | 'Retired' | 'Archived';
  first_seen: string;
  last_seen: string;
  usage_count: number;
}

export interface ProductHealthSnapshot {
  project_id: string;
  computed_at: string;
  composite_score: number;
  sub_scores: {
    active_users: number;
    returning_users: number;
    engagement: number;
    adoption: number;
    retention: number;
  };
}
