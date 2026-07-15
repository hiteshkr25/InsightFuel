export interface DemoOrganization {
  id: string;
  name: string;
  created_at: string;
}

export interface DemoProject {
  id: string;
  workspace_id: string;
  name: string;
}

export function getDemoOrganizations(): DemoOrganization[] {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `org_demo_${i + 1}`,
    name: `Enterprise Partner ${i + 1} Corp`,
    created_at: new Date(2025, 0, 1).toISOString(),
  }));
}

export function getDemoProjects(orgId: string): DemoProject[] {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `proj_demo_${orgId.split('_').pop()}_${i + 1}`,
    workspace_id: `ws_demo_${orgId.split('_').pop()}`,
    name: `Primary SaaS App - Suite ${i + 1}`,
  }));
}

export function getDemoSessionMetrics(projectId: string, limit: number = 100): any[] {
  return Array.from({ length: limit }, (_, i) => ({
    session_id: `sess_demo_${projectId}_${i}`,
    duration: 300 + (i * 12) % 600,
    active_time: 250 + (i * 12) % 500,
    idle_time: 50 + (i * 12) % 100,
    quality_score: 85 + (i % 15),
    device: i % 3 === 0 ? 'mobile' : 'pc',
    browser: i % 2 === 0 ? 'Chrome' : 'Safari',
    os: i % 2 === 0 ? 'Windows' : 'macOS',
    country: i % 4 === 0 ? 'USA' : 'Germany',
    timestamp: new Date().toISOString(),
  }));
}

export function getDemoUserActivity(_projectId: string): any[] {
  return Array.from({ length: 30 }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    return {
      timestamp: dt.toISOString().split('T')[0],
      dau: 1200 + (i * 73) % 400,
      wau: 5400 + (i * 145) % 1200,
      mau: 18000 + (i * 324) % 3000,
      new_users: 150 + (i * 27) % 100,
      returning_users: 1050 + (i * 54) % 300,
    };
  });
}

export function getDemoRetentionMetrics(): any[] {
  const cohorts = ['2026-06-01', '2026-06-08', '2026-06-15', '2026-06-22'];
  const metrics: any[] = [];
  cohorts.forEach((cohortDate) => {
    for (let day = 0; day <= 7; day++) {
      const cohortSize = 1000;
      const rate = day === 0 ? 1.0 : Math.max(0.2, 0.8 - (day * 0.08));
      metrics.push({
        cohort_date: cohortDate,
        day_number: day,
        cohort_size: cohortSize,
        retained_users: Math.floor(cohortSize * rate),
        retention_rate: rate,
      });
    }
  });
  return metrics;
}

export function getDemoFunnelMetrics(): any[] {
  const steps = [
    { step_number: 1, step_name: 'landing_page', completed: 5000, conversion: 1.0, drop: 0.0 },
    { step_number: 2, step_name: 'feature_view', completed: 3200, conversion: 0.64, drop: 0.36 },
    { step_number: 3, step_name: 'checkout_click', completed: 1200, conversion: 0.24, drop: 0.40 },
  ];
  return steps.map((s) => ({
    funnel_id: 'purchase_funnel',
    step_number: s.step_number,
    step_name: s.step_name,
    completed_users: s.completed,
    dropoff_rate: s.drop,
    conversion_rate: s.conversion,
    avg_completion_time: 4.5,
    timestamp: new Date().toISOString(),
  }));
}
