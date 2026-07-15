RECOMMENDATION_TEMPLATES = {
  "LOW_ADOPTION": {
    "title": "Core Feature Adoption Deficit",
    "description": "Weighted feature adoption is low, suggesting users interact with very few selector targets.",
    "suggested_action": "Review feature onboarding flows and place guided tooltips on underutilized elements.",
    "expected_impact": "Improve session engagement depth and increase stickiness.",
    "default_severity": "warning"
  },
  "DECLINING_FEATURE": {
    "title": "Review UX Layout for Declining Feature",
    "description": "Interaction volume on a tracked feature has declined significantly week-over-week.",
    "suggested_action": "Conduct usability testing to identify UX friction or layout misalignment.",
    "expected_impact": "Stabilize usage retention and recover interaction volume metrics.",
    "default_severity": "warning"
  },
  "HIGH_ERROR_RATE": {
    "title": "App Reliability Degrading Below Alert Threshold",
    "description": "Product stability index has dropped due to rising JS error and crash rates.",
    "suggested_action": "Inspect the developer error trace list to debug top uncaught exceptions.",
    "expected_impact": "Minimize user friction and stabilize workflow conversions.",
    "default_severity": "critical"
  },
  "PERFORMANCE_REGRESSION": {
    "title": "User Performance Regressions Observed",
    "description": "Calculated performance score has dropped, indicating long page load latencies.",
    "suggested_action": "Optimize bundle payloads and implement asset caching on network endpoints.",
    "expected_impact": "Reduce load times and decrease user drop-offs.",
    "default_severity": "warning"
  },
  "LOW_RETENTION": {
    "title": "User Retention Rate Declining",
    "description": "Weekly returning cohort retention has dropped below target threshold levels.",
    "suggested_action": "Deploy targeted email re-engagement campaigns and push feature updates notifications.",
    "expected_impact": "Increase long-term cohort values and user return cycles.",
    "default_severity": "critical"
  },
  "LOW_ENGAGEMENT": {
    "title": "Sudden Traffic Engagement Drop Detected",
    "description": "Identified traffic levels dropped significantly below standard rolling threshold.",
    "suggested_action": "Review API ingress logs and server gateway configurations to confirm telemetry connections are operational.",
    "expected_impact": "Restore missing tracking events and prevent gaps in behavioral data reporting.",
    "default_severity": "critical"
  },
  "FEATURE_GROWTH": {
    "title": "Promote Visibility for Rapidly Growing Feature",
    "description": "Feature selector showed rapid week-over-week user interaction growth.",
    "suggested_action": "Increase accessibility by moving the element to primary navigation sections.",
    "expected_impact": "Further accelerate feature discoverability and user conversion paths.",
    "default_severity": "info"
  },
  "FEATURE_DEPRECATION": {
    "title": "Candidate for Feature Deprecation",
    "description": "Feature interaction has fallen below the 1% target threshold for more than 14 days.",
    "suggested_action": "Schedule a product review session to assess if this feature should be retired.",
    "expected_impact": "Clean up code and product design, simplifying layout structures.",
    "default_severity": "info"
  }
}
