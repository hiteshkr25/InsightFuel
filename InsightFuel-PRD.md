# InsightFuel
## Product Intelligence & User Behavior Analytics Platform
### Product Requirements Document

| | |
|---|---|
| **Document type** | Product Requirements Document (Engineering Source of Truth) |
| **Product** | InsightFuel — Product Intelligence & User Behavior Analytics Platform |
| **Version** | 2.0 |
| **Status** | Approved for Engineering Planning |
| **Owner** | Product Management |
| **Audience** | Engineering, Data Platform, SRE, Design, Security, Executive Sponsors |
| **Related documents** | InsightFuel-Architecture.md (System Architecture), InsightFuel API Reference (generated from OpenAPI spec) |

---

## Document Control

| Version | Date | Summary of Change |
|---|---|---|
| 1.0 | 2026-07-13 | Initial PRD (analytics-platform baseline, Mixpanel/PostHog-comparable scope) |
| 2.0 | 2026-07-13 | Full re-scope as a Product Intelligence & User Behavior Analytics Platform. Adds Feature Intelligence Engine, Product Health Engine, AI Insights Engine, expanded SDK framework matrix, formal event taxonomy, and enterprise dashboard suite. |

---

## Table of Contents

1. Executive Summary
2. Product Vision & Positioning
3. Core Differentiators
4. Target Users & Personas
5. Product Goals & Objectives
6. Product Scope
7. Event Taxonomy
8. Feature Intelligence Engine
9. Product Health Engine
10. Analytics Capabilities
11. AI Insights Engine
12. SDK Requirements
13. System Architecture Overview
14. Data Model
15. API Design
16. Power BI Integration
17. Dashboards
18. Security & Compliance
19. Privacy Architecture
20. Non-Functional Requirements
21. Success Metrics & KPIs
22. Roadmap
23. Risks & Open Questions
24. Appendix — Glossary

---

## 1. Executive Summary

InsightFuel is a plug-and-play **Product Intelligence & User Behavior Analytics Platform** that gives software teams a real-time, quantitative understanding of how their product is actually used — without requiring a data engineering investment, a manual tracking-plan rollout, or a dedicated analytics team to interpret the output.

Where conventional analytics tools stop at reporting raw event counts, InsightFuel is built around three engines that convert raw interaction data into decisions a product team can act on the same day:

- The **Feature Intelligence Engine**, which automatically ranks, scores, and trends every feature in a product without any manual event configuration.
- The **Product Health Engine**, which distills dozens of underlying behavioral signals into a single, explainable **Product Health Score (0–100)**.
- The **AI Insights Engine**, which surfaces specific, metric-grounded recommendations ("Feature adoption dropped 17% week-over-week among mobile users") rather than generic natural-language summaries.

InsightFuel is designed to be integrated in minutes — a single `InsightFuel.init(API_KEY)` call — across the frameworks and backend stacks that make up the majority of production web applications today (React, Angular, Vue, Next.js, Nuxt, Express, Django, Flask, Laravel, ASP.NET, WordPress, and static sites), and to scale from a single side project to a multi-project enterprise portfolio with strict tenant isolation, role-based access, and Power BI-based executive reporting.

This document is the authoritative specification for what InsightFuel does, who it is for, and how it must behave. It is the primary source of truth engineering should build against.

---

## 2. Product Vision & Positioning

### 2.1 Vision Statement

> Every product team should be able to answer "is our product actually working for our users?" with a number, a trend, and a reason — within minutes of installing a single SDK.

### 2.2 What InsightFuel Is

InsightFuel is a **Product Intelligence Platform**. It exists to answer product questions — which features matter, where users get stuck, whether the product is getting healthier or sicker over time, and what to do next — not merely to record that a click happened.

InsightFuel is explicitly **not** positioned as:

- A website-traffic analytics tool (that is Google Analytics' domain — page views, referrers, bounce rate as primary metrics).
- A session-replay or heatmap tool (that is a visual/qualitative layer InsightFuel does not attempt to replace).
- A generic event warehouse requiring a BI team to build every report from scratch.

InsightFuel occupies the same conceptual category as Mixpanel, Amplitude, Heap, and PostHog — **product analytics** — but differentiates on three axes: (1) **zero-configuration intelligence** (features, health, and insights are computed automatically, not hand-built), (2) **explainability** (every score and recommendation traces back to the specific metrics that produced it), and (3) **enterprise reporting continuity** via native Power BI integration rather than requiring customers to build their own export pipeline.

### 2.3 Positioning Statement

For product teams who need to understand user behavior without hiring a data team, InsightFuel is a plug-and-play product intelligence platform that automatically discovers feature usage, computes a real-time Product Health Score, and generates AI-grounded recommendations — unlike Mixpanel, Amplitude, or PostHog, which require teams to manually define and maintain their own tracking plans and dashboards before any of that value is available.

---

## 3. Core Differentiators

The table below states each differentiator as a concrete product capability, not a marketing claim, and cross-references the PRD section where it is fully specified.

| Differentiator | What it concretely means | Specified in |
|---|---|---|
| **Plug-and-play SDK, single initialization** | `InsightFuel.init(API_KEY)` is the only required call. No manual event schema, no tracking plan spreadsheet, no per-button instrumentation required to get initial value. | Section 12 |
| **Automatic event discovery** | Wherever technically feasible (DOM interactions, route changes, form submissions, API calls made from the client), InsightFuel infers meaningful interaction events without the developer writing `track()` calls for each one. | Section 7, 12 |
| **Feature Intelligence Engine** | Every distinct feature surface in the product is automatically identified, ranked, and scored on adoption, growth, stickiness, and lifetime — computed, not configured. | Section 8 |
| **Product Health Score** | A single 0–100 score, recomputed continuously, that distills engagement, retention, adoption, and quality signals into one explainable number executives and PMs can track over time. | Section 9 |
| **AI-powered Product Recommendations** | Specific, metric-referenced recommendations generated from statistically meaningful shifts in the underlying data — never generic templated text. | Section 11 |
| **Real-time analytics** | Dashboards reflect event activity within seconds, not next-day batch windows, for the metrics that matter for in-the-moment decisions (live user count, current funnel drop-off). | Section 10, 13 |
| **Power BI integration** | Processed, governed metrics — not raw events — flow into Power BI, giving executives production-grade reporting without exposing raw user-level data outside the platform's access controls. | Section 16 |
| **Multi-project analytics** | A single organization can track multiple applications/products under one account, with cross-project portfolio views and per-project isolation. | Section 6, 13 |
| **Privacy-first architecture** | PII scrubbing, consent enforcement, configurable retention, and data-subject rights (export/delete) are core architecture, not bolted-on compliance features. | Section 19 |
| **Enterprise-ready SDK** | Framework coverage spanning modern frontend frameworks and backend stacks, with batching, retry, offline queuing, deduplication, and sub-15KB footprint as hard requirements. | Section 12 |

### 3.1 Comparative Positioning

| Capability | InsightFuel | Mixpanel | Amplitude | PostHog | Google Analytics |
|---|---|---|---|---|---|
| Automatic feature discovery | Yes | No (manual tracking plan) | No (manual tracking plan) | Partial (autocapture, not feature-level intelligence) | No (page-centric) |
| Single computed health score | Yes | No | No (custom-built via Amplitude's Compass, manual) | No | No |
| AI recommendations grounded in real metrics | Yes | Limited (Mixpanel AI is query-assist, not proactive) | Limited | No | No |
| Native Power BI metric pipeline | Yes | Via 3rd-party connector | Via 3rd-party connector | Via 3rd-party connector | Via 3rd-party connector |
| Zero-config onboarding | Yes | No | No | Partial | Partial |
| Primary analytical unit | Feature/product behavior | Event | Event | Event | Page/session |

---

## 4. Target Users & Personas

InsightFuel is built for seven personas across the product organization. Each persona has a distinct primary workflow inside the platform; the platform's information architecture (Section 17, Dashboards) is organized around these workflows rather than around raw data tables.

### 4.1 Product Manager — "Priya"
**Goal:** Understand which features drive retention and which are dead weight, without waiting on an analyst.
**Primary workflows:** Feature Intelligence Dashboard, funnel analysis, Product Health Score trend, AI recommendations feed.
**Success looks like:** Priya can walk into a roadmap prioritization meeting with a ranked list of feature adoption and stickiness scores, generated automatically, with no query-writing.

### 4.2 Software Engineer — "Devon"
**Goal:** Instrument the product for analytics without becoming responsible for a tracking plan or a data pipeline.
**Primary workflows:** SDK installation, Developer Dashboard (event delivery health, SDK errors, ingestion status), API key management.
**Success looks like:** Devon adds one `init()` call during a sprint, confirms events are flowing via the live debugger, and never has to think about analytics infrastructure again.

### 4.3 Startup Founder — "Felix"
**Goal:** Get a single, honest signal for "is the product working" without hiring a data team or paying enterprise analytics pricing.
**Primary workflows:** Executive Dashboard, Product Health Score, weekly digest email.
**Success looks like:** Felix checks one number (Product Health Score) and its trend line before every investor update.

### 4.4 UX Designer — "Uma"
**Goal:** Identify where users struggle or abandon a flow, to prioritize design fixes.
**Primary workflows:** User Journey Analysis, Funnel Analysis, Session Analytics, drop-off visualization.
**Success looks like:** Uma can see exactly which step of onboarding loses the most users and cross-reference it with device/browser breakdowns to rule out a rendering bug versus a genuine UX problem.

### 4.5 Growth Team Member — "Grace"
**Goal:** Understand acquisition-to-activation-to-retention performance across cohorts and traffic sources.
**Primary workflows:** Cohort Analysis, Retention Analysis, Traffic Source Analytics, funnel comparison across segments.
**Success looks like:** Grace can compare activation rate for users acquired via paid vs. organic channels and act on the difference within the same session.

### 4.6 Data Analyst — "Amir"
**Goal:** Perform deeper ad hoc analysis than dashboards allow, and feed clean, governed data into other reporting.
**Primary workflows:** Power BI integration, raw-metric export, saved segment/cohort definitions reusable across analyses.
**Success looks like:** Amir builds an executive Power BI report on top of InsightFuel-computed metrics without needing direct database access or writing ETL.

### 4.7 Data Scientist — "Sofia"
**Goal:** Access well-structured, deduplicated, enriched event data to build custom models (churn prediction, LTV) beyond what InsightFuel computes natively.
**Primary workflows:** Data export API, event schema registry, programmatic access to computed feature/health metrics as model features.
**Success looks like:** Sofia treats InsightFuel's processed event stream as a reliable, documented feature store input rather than needing to re-derive cleaning logic herself.

---

## 5. Product Goals & Objectives

| Goal | Description | How InsightFuel achieves it |
|---|---|---|
| **Reduce time-to-first-insight** | A team should get their first meaningful insight — not just a raw event count — within minutes of integration. | Automatic event discovery + Feature Intelligence Engine begin producing ranked output as soon as sufficient event volume exists, with no manual configuration step blocking value. |
| **Understand feature adoption** | Teams should know, without instrumentation effort, which features are actually used and by whom. | Feature Intelligence Engine (Section 8) computes adoption %, growth, and stickiness automatically from discovered feature-level events. |
| **Improve user engagement** | Teams need actionable signal on what increases or decreases engagement, not just a vanity DAU chart. | Product Health Engine engagement sub-score + AI Insights Engine surfaces specific engagement-moving events. |
| **Measure product health** | Teams need one trackable number reflecting overall product trajectory, comparable week over week. | Product Health Score (Section 9), a single weighted 0–100 metric with full sub-score breakdown for explainability. |
| **Discover user journeys** | Teams need to see the actual paths users take through the product, not assume them. | User Journey Analysis and Funnel Analysis (Section 10). |
| **Identify product bottlenecks** | Teams need to know precisely where users abandon a flow or encounter friction/errors. | Funnel drop-off analysis + Error Analytics + AI Insights correlating abandonment with specific steps/segments. |
| **Increase developer productivity** | Analytics integration should cost a development team hours, not sprints, and should not require ongoing maintenance of a tracking plan. | Single-call SDK init, automatic event discovery, framework-native packages (Section 12). |

---

## 6. Product Scope

### 6.1 In Scope — v1 (MVP)
- SDK support for React, Next.js, Vue, and static HTML/JS sites (broadest immediate coverage of the frontend ecosystem); server-side ingestion REST API usable from any backend.
- Automatic event discovery for DOM interaction events, route/page changes, and form submissions.
- Manual `track()`/`identify()` API for custom business events alongside automatic discovery.
- Feature Intelligence Engine v1: Most/Least Used Features, Feature Adoption %, Feature Engagement Score, Feature Popularity Ranking.
- Product Health Score v1: computed from Active Users, Returning Users, Engagement Score, Feature Adoption, Retention.
- Core analytics: Event Analytics, Feature Analytics, Funnel Analysis, Retention Analysis, Session Analytics.
- Developer Dashboard, Product Dashboard.
- Single-project workspace with role-based access (Owner, Admin, Analyst, Viewer).
- Privacy controls: PII field scrubbing, consent flag support, configurable data retention, data export/delete APIs.

### 6.2 In Scope — v1.x (Fast Follow)
- SDK support for Angular, Nuxt, Express, Django, Flask, Laravel, ASP.NET, WordPress.
- Feature Intelligence Engine v2: Trending/Declining Features, Feature Growth, Feature Stickiness, Feature Usage Frequency, Feature Lifetime.
- Product Health Score v2: adds Session Quality, Feature Diversity, Error Rate, User Satisfaction Signals sub-scores.
- Cohort Analysis, Device/Browser/Geographic/Traffic Source Analytics.
- AI Insights Engine v1 (rule-based statistical anomaly detection + templated-but-metric-grounded natural language generation).
- Power BI integration (scheduled metric export + streaming dataset push).
- Executive Dashboard, Feature Intelligence Dashboard, Power BI Dashboard.
- Multi-project workspace with organization-level portfolio view.

### 6.3 In Scope — v2 (Enterprise Maturity)
- AI Insights Engine v2: model-based (not purely rule-based) anomaly detection and natural-language generation, still strictly grounded in computed metrics (no hallucinated claims — Section 11.4 defines the grounding constraint).
- Search Analytics, Performance Analytics, Error Analytics as first-class capabilities with dedicated dashboards.
- AI Dashboard as a distinct surface.
- SSO (SAML/OIDC), advanced audit logging, customer-managed encryption keys (enterprise security tier).
- Data residency options for regulated customers.

### 6.4 Explicitly Out of Scope
- Session replay / screen recording.
- Full experimentation/A-B testing statistical engine (may be evaluated as a separate product in the future).
- Native mobile SDKs (iOS/Android) — deferred beyond this document's horizon; web-first is the strategic focus.
- General-purpose data warehouse replacement — InsightFuel computes and exposes product metrics; it is not a substitute for a customer's broader data warehouse.

---

## 7. Event Taxonomy

InsightFuel defines a fixed set of top-level event categories. Every event ingested — whether automatically discovered or manually tracked via `track()` — is classified into exactly one category. This taxonomy is the backbone that the Feature Intelligence Engine, Product Health Engine, and AI Insights Engine all read from; without a consistent taxonomy, cross-feature and cross-project comparison would not be possible.

| Category | Purpose | Examples | Captured by |
|---|---|---|---|
| **Navigation Events** | Track movement through the application's structure — the "where" of user behavior. | `page_view`, `route_change`, `tab_switch`, `modal_open`, `modal_close` | Automatic (SPA router hook, page load listener) |
| **Feature Events** | Track interaction with a discrete product capability — the core input to the Feature Intelligence Engine. | `feature_used:export_report`, `feature_used:invite_teammate`, `feature_used:filter_applied` | Automatic (DOM interaction inference) + manual `track()` for business-logic features not expressed as a UI click |
| **User Events** | Track identity and lifecycle state changes for a user. | `user_signed_up`, `user_identified`, `user_logged_in`, `user_logged_out`, `user_upgraded_plan` | Manual (`identify()`, `track()`) — identity events are deliberately never auto-inferred, to avoid misclassifying anonymous activity |
| **Session Events** | Track the boundaries and quality of a usage session. | `session_started`, `session_ended`, `session_idle_timeout` | Automatic (SDK session manager) |
| **Performance Events** | Track client-side performance characteristics relevant to product experience. | `page_load_time`, `api_response_time`, `render_time` | Automatic (Performance API instrumentation) |
| **Error Events** | Track failures visible to or affecting the user. | `js_exception`, `api_error`, `form_validation_error` | Automatic (global error handler) + manual for caught application-level errors |
| **Business Events** | Track outcomes that map directly to business value, generally not inferable from the DOM. | `checkout_completed`, `subscription_created`, `trial_converted` | Manual (`track()`) — business events require developer intent and are never auto-discovered, since their meaning is domain-specific |
| **System Events** | Track platform/SDK-level operational signals, not end-user behavior. | `sdk_initialized`, `sdk_flush`, `sdk_retry`, `consent_updated` | Automatic (SDK internals) |

### 7.1 Event Envelope

Every event, regardless of category, shares a common envelope so downstream engines can process any event type uniformly:

```
{
  "event_id": "evt_9f13a2...",         // client-generated, used for idempotency/dedup
  "event_name": "feature_used:export_report",
  "category": "feature",               // navigation | feature | user | session | performance | error | business | system
  "distinct_id": "usr_882a...",
  "project_id": "proj_44f1...",
  "timestamp": "2026-07-13T10:15:30Z",
  "properties": { ... },               // event-specific key/value payload
  "context": {                         // automatically attached metadata
    "url": "...", "referrer": "...",
    "device": "...", "os": "...", "browser": "...",
    "viewport": "...", "sdk_version": "...", "session_id": "..."
  }
}
```

---

## 8. Feature Intelligence Engine

The Feature Intelligence Engine is InsightFuel's flagship differentiator. It converts the raw stream of **Feature Events** into a continuously recomputed, ranked understanding of every feature in a product — automatically, without a human defining "here is a list of our features" ahead of time.

### 8.1 What Counts as a "Feature"

A **feature** is any distinct, addressable unit of product capability that InsightFuel can identify from either (a) automatically discovered interaction patterns (e.g., a consistently-clicked element with a stable identifier/selector across sessions) or (b) a manually defined `feature_used:<feature_key>` event supplied by the developer for capabilities not expressed as a single UI element (e.g., a background export job).

The Feature Registry (part of the metadata store) maintains one row per discovered feature per project, with a human-editable display name so raw selectors/keys can be relabeled without losing historical computation.

### 8.2 Feature-Level Metrics

Each metric below is computed per feature, per project, on a rolling and point-in-time basis, and is fully defined so engineering can implement it deterministically.

| Metric | Definition | Computation Window |
|---|---|---|
| **Most Used Features** | Features ranked by total interaction count (descending). | Rolling 7/30/90-day, selectable |
| **Least Used Features** | Features ranked by total interaction count (ascending), excluding features younger than a minimum observation window (default 7 days) to avoid penalizing newly shipped features. | Rolling 7/30/90-day |
| **Trending Features** | Features whose interaction count in the current period exceeds the previous period by a statistically meaningful margin (default threshold: >20% growth with a minimum absolute event volume floor to avoid noise from low-volume features). | Period-over-period (week-over-week default) |
| **Declining Features** | Same computation as Trending, inverted — features whose usage has meaningfully decreased period-over-period. | Period-over-period |
| **Feature Adoption %** | `(distinct users who triggered the feature at least once in the window) / (distinct active users in the window) × 100`. | Rolling 30-day default |
| **Feature Growth** | `(adoption % this period − adoption % previous period) / adoption % previous period × 100`. | Period-over-period |
| **Feature Stickiness** | `(distinct users using the feature on a given day / distinct users using the feature at least once in the trailing 30 days) × 100`, analogous to a DAU/MAU ratio scoped to a single feature — measures habitual vs. one-time use. | Daily, trailing 30-day denominator |
| **Feature Engagement Score** | A composite 0–100 score combining normalized usage frequency, stickiness, and adoption breadth (formula in 8.3) — the single number used for Popularity Ranking. | Rolling 30-day |
| **Feature Usage Frequency** | Average number of times a feature is triggered per user who has adopted it, in the window. | Rolling 30-day |
| **Feature Lifetime** | Days elapsed between a feature's first observed event and its most recent observed event — identifies features that were used briefly and then abandoned entirely by all users versus features with sustained use. | All-time, recomputed continuously |
| **Feature Popularity Ranking** | Ordinal rank of all features in a project by Feature Engagement Score, descending. | Rolling 30-day |

### 8.3 Feature Engagement Score — Formula

```
Feature Engagement Score =
      (0.4 × normalized_usage_frequency)
    + (0.35 × stickiness)
    + (0.25 × adoption_breadth)

normalized_usage_frequency = min(usage_frequency / project_p90_usage_frequency, 1) × 100
adoption_breadth = (adopters / total_active_users) × 100
```

Weights (0.4 / 0.35 / 0.25) are configurable per project at the Admin tier (Section 17) but default to the values above, chosen so that habitual use (stickiness) is not fully dominated by raw frequency (a feature used obsessively by a tiny minority should not outrank a feature used moderately by most of the user base).

### 8.4 Automatic Feature Discovery — Mechanism

1. The SDK's DOM observer watches for interaction events (click, submit, change) on elements bearing a stable identifying attribute (`id`, `data-testid`, or a generated stable selector path when neither is present).
2. Each unique (selector, page context) pair is treated as a **candidate feature**.
3. A candidate is promoted to a tracked feature in the Feature Registry once it crosses a minimum-volume threshold (default: 50 interactions across at least 5 distinct users within 14 days) — this avoids polluting the registry with one-off or environment-specific noise (e.g., a QA-only debug button).
4. Developers can explicitly promote, rename, merge, or suppress candidate/discovered features via the Feature Intelligence Dashboard, since automatic discovery is a starting point, not a replacement for human judgment on what constitutes a meaningful feature.

### 8.5 Why This Cannot Be a Manual Tracking Plan

Manually-defined tracking plans (the Mixpanel/Amplitude norm) require a team to enumerate every feature up front and instrument each one individually — a task that is routinely skipped, becomes stale as the product changes, and blocks all downstream analysis until completed. InsightFuel's Feature Intelligence Engine is architected so that meaningful feature-level insight exists from day one of integration, with manual curation as a refinement step rather than a prerequisite.

---

## 9. Product Health Engine

### 9.1 Purpose

The Product Health Score answers a single question that every persona in Section 4 needs answered in a different context: **"Is this product getting better or worse?"** A Product Manager needs it for roadmap prioritization, a Founder needs it for investor updates, and an Engineer needs it as a sanity check that a recent release didn't quietly damage the experience. Rather than forcing each persona to synthesize this from a dozen separate charts, InsightFuel computes it directly.

### 9.2 Score Composition

The Product Health Score is a weighted composite on a 0–100 scale, computed continuously (recalculated at minimum hourly, with the option to view its value at any historical point). Every sub-score is independently visible so the composite is never a "black box" — a drop in the overall score must always be traceable to a specific contributing sub-score.

| Sub-Score | Weight (v1) | Weight (v2) | What it measures | Primary inputs |
|---|---|---|---|---|
| Active Users | 20% | 15% | Breadth of current usage relative to the project's historical baseline | DAU/WAU/MAU trend |
| Returning Users | 15% | 12% | Whether users come back, independent of new-user growth | Returning-user ratio (users active in period who were also active in the prior period) |
| Engagement Score | 20% | 15% | Depth of usage per session/user | Events per session, session duration, feature interactions per session |
| Feature Adoption | 20% | 15% | Breadth of feature usage across the user base | Mean Feature Adoption % across all tracked features (Section 8.2) |
| Retention | 25% | 18% | Whether users persist over time | N-day/week retention curve area (Section 10.5) |
| Session Quality | — | 8% | Whether sessions represent meaningful engagement vs. bounces | Bounce-session ratio, average session depth |
| Feature Diversity | — | 7% | Whether users engage with a healthy breadth of the product surface, not just one feature | Shannon-diversity-style index over per-user feature usage distribution |
| Error Rate | — | 5% | Whether the product is technically healthy for the user | Error events per session, error-affected session ratio |
| User Satisfaction Signals | — | 5% | Explicit or inferable satisfaction indicators | In-product feedback/NPS events (if integrated), rage-click rate, abandonment rate |

v1 ships with the five-factor score (weights sum to 100%); v2 introduces the four additional sub-scores with rebalanced weights, per the Scope defined in Section 6.2–6.3.

### 9.3 Score Calculation — Method

```
1. Each sub-score is computed independently on its own 0–100 scale using
   project-relative normalization: a sub-score of 50 represents the
   project's own trailing-90-day median for that signal, not an
   arbitrary global benchmark. This avoids penalizing early-stage or
   niche products against a "one size fits all" absolute scale.

2. Normalization function (per sub-score):
   normalized = 50 + 50 × tanh((current_value − trailing_median) / trailing_stddev)
   — bounded smoothly into [0, 100], resistant to single-point outliers.

3. Product Health Score = Σ (sub-score × weight)

4. The score is recomputed hourly and stored as a time series so
   Product Health can itself be charted as a trend line, not just a
   snapshot number.
```

### 9.4 Explainability Requirement

Every time the Product Health Score is displayed, the UI must provide a one-click breakdown showing each sub-score's current value, its trailing trend arrow, and its weighted contribution to the composite. **A score without an explanation is treated as a product defect, not an acceptable v1 shortcut** — this is what separates InsightFuel's health score from a black-box vendor metric that teams learn to distrust.

### 9.5 Alerting on Health Score Movement

The Alerting Service (Architecture doc, Section 5) supports threshold and delta-based alerts specifically on the Product Health Score and each sub-score independently, so a team can be notified ("Product Health Score dropped 9 points this week, driven by a 22% drop in the Retention sub-score") without manually watching a dashboard.

---

## 10. Analytics Capabilities

Each capability below is a distinct analytical surface backed by the Query API (Architecture doc, Section 8) and exposed through one or more dashboards (Section 17).

### 10.1 Event Analytics
Raw and aggregated views of any event: time-series trend, breakdown by any property dimension, comparison across time periods. This is the foundational capability every other capability composes on top of.

### 10.2 Feature Analytics
The query-facing surface of the Feature Intelligence Engine (Section 8): per-feature drill-down showing its full metric set (adoption, growth, stickiness, engagement score) and the user segments most/least engaged with it.

### 10.3 User Journey Analysis
Reconstructs the sequences of events individual users or user segments actually follow through the product, visualized as a path/sankey-style flow, surfacing the most common paths and the most common deviation points from an expected path.

### 10.4 Funnel Analysis
Ordered multi-step conversion measurement (2–10 steps) with configurable conversion window, per-step drop-off rate, time-to-convert distribution, and segment/property filtering — the primary tool for diagnosing bottlenecks (Product Goal in Section 5).

### 10.5 Retention Analysis
N-day/week/month cohort retention grid anchored on a starting event and a return event/definition of "active." Retention curve area is a direct input to the Product Health Engine's Retention sub-score.

### 10.6 Cohort Analysis
Reusable, saved user segments defined by behavioral or property criteria (e.g., "signed up in the last 30 days AND used Feature X at least twice"), usable as a filter across any other capability in this section.

### 10.7 Session Analytics
Session-level metrics: duration, event count per session, session depth (distinct features touched), bounce-session rate. Session boundaries are computed by the SDK's session manager using a configurable idle timeout (default 30 minutes).

### 10.8 Device Analytics
Usage breakdown by device type/model, screen size, and input modality, informing whether specific features underperform on specific device classes.

### 10.9 Browser Analytics
Usage and error-rate breakdown by browser and version, primarily used in conjunction with Error Analytics to isolate browser-specific technical issues from genuine UX problems.

### 10.10 Geographic Analytics
Usage breakdown by derived geography (country/region, from IP-derived geolocation, with raw IP discarded per Section 19), used for regional feature-adoption comparison and go-to-market insight, not individual user tracking.

### 10.11 Traffic Source Analytics
Attribution of first-touch and session-level traffic source (referrer, UTM parameters) to downstream activation and retention outcomes — the primary input to the Growth persona's channel comparison workflow.

### 10.12 Search Analytics
For products with in-app search, tracks query volume, zero-result-query rate, and click-through from search results — a first-class capability in v2 (Section 6.3), since search behavior is one of the strongest signals of unmet user intent.

### 10.13 Performance Analytics
Aggregated client-side performance signals (page load time, API response time as observed by the client, render time) correlated against engagement and retention, to test whether performance regressions are measurably affecting product health.

### 10.14 Error Analytics
Aggregated client and reported-server error rates, error-affected session ratio, and top error signatures — feeds directly into the Product Health Engine's Error Rate sub-score (v2).

### 10.15 Feature Intelligence
The dashboard-level exposure of Section 8 in full: rankings, trends, growth, stickiness, all filterable and drillable.

### 10.16 Product Health
The dashboard-level exposure of Section 9: current score, historical trend, sub-score breakdown, and active alerts.

### 10.17 AI Insights
The dashboard-level feed of the AI Insights Engine's output (Section 11): a chronological, filterable list of generated recommendations, each linked to the underlying metric view that produced it.

---

## 11. AI Insights Engine

### 11.1 Design Principle: Grounding, Not Generation

The single hard requirement on this engine is that **every recommendation must be traceable to a specific, real, computed metric** — a delta, a threshold crossing, or a statistically significant deviation from baseline. The engine is explicitly not permitted to produce generic, templated encouragement ("Consider improving your onboarding!") disconnected from actual data. If no metric supports a claim, no claim is generated.

### 11.2 Recommendation Categories

| Category | Trigger condition | Example output |
|---|---|---|
| Feature adoption shift | Feature Adoption % change exceeds significance threshold period-over-period | "Feature adoption for **Export Report** dropped by 17% week-over-week (32% → 15% of active users)." |
| Funnel abandonment | A specific funnel step's drop-off rate exceeds its trailing baseline by a defined margin | "62% of users abandon onboarding after Step 2 (\"Connect your data source\"), up from a 38% baseline over the last 30 days." |
| Feature trend | Feature Growth crosses the Trending/Declining threshold (Section 8.2) | "**Bulk Export** is trending: usage grew 44% over the last 14 days, driven primarily by users on the Team plan." |
| Segment-specific behavior | A statistically meaningful difference in a metric exists between two segments (device, plan, geography, cohort) | "Users on mobile spend 42% more time in **Feature A** per session than desktop users." |
| Health score driver | A sub-score movement is large enough to materially move the Product Health Score | "Product Health Score fell 9 points this week; 6 of those points are attributable to a decline in the Retention sub-score." |
| Error correlation | A spike in error rate co-occurs with a drop in a usage or conversion metric on the same feature/page | "Checkout completion rate fell 11% in the same window that API error rate on `/checkout` rose from 0.4% to 3.1%." |

### 11.3 Engine Architecture (v1 — Rule-Based Statistical Detection)

1. **Metric watchers** run on a schedule (hourly for fast-moving metrics, daily for slower ones like retention) and compare current-period values against a trailing statistical baseline (median + standard deviation over a rolling window, consistent with the Product Health normalization approach in Section 9.3).
2. A movement is flagged only if it exceeds both (a) a relative-change threshold and (b) an absolute-volume floor, to prevent low-traffic noise from generating false recommendations.
3. Flagged movements are passed to a **natural language generation layer** that fills a category-specific template (Section 11.2) with the actual computed numbers — never inventing a number that wasn't part of the underlying computation.
4. Each generated recommendation is stored with a permanent link to the exact query/metric definition and time window that produced it, so a user can always click through from the recommendation to the underlying evidence.

### 11.4 Engine Architecture (v2 — Model-Assisted Detection)

v2 introduces a statistical/ML anomaly-detection layer (e.g., seasonal decomposition + outlier detection) to catch subtler or multi-variate shifts that fixed-threshold rules would miss, and a language-model-assisted generation step for more natural phrasing of the same grounded, computed facts. The grounding constraint from Section 11.1 is architecturally enforced in v2 exactly as in v1: the language-generation step is only ever permitted to phrase numbers that were already computed by the metric watchers — it is never given latitude to introduce unverified claims. This is enforced by having the generation step consume a structured fact object (metric name, before value, after value, % change, segment, time window) rather than open-ended access to raw data.

### 11.5 Delivery

Recommendations appear in the AI Dashboard (Section 17.6) as a chronological, filterable feed, and are optionally delivered via the Alerting Service (email/Slack) for high-severity items, using the same delivery channel infrastructure defined in the Architecture document.

---

## 12. SDK Requirements

### 12.1 Zero-Configuration Initialization

The SDK's public contract is intentionally minimal:

```javascript
InsightFuel.init("API_KEY");
// Automatic event discovery begins immediately.
// No additional configuration is required to start receiving
// Navigation, Session, Performance, and (candidate) Feature events.
```

Manual instrumentation remains available and is required for Business Events and identity resolution, since these cannot be safely inferred:

```javascript
InsightFuel.identify(userId, { plan: "pro" });
InsightFuel.track("checkout_completed", { amount: 49.0, currency: "USD" });
```

### 12.2 Framework & Platform Coverage

| Platform | Package | Integration model | Scope |
|---|---|---|---|
| React | `@insightfuel/react` | Provider component + hook (`useInsightFuel()`); router integration for automatic route-change events | v1 (MVP) |
| Next.js | `@insightfuel/nextjs` | App Router + Pages Router support; automatic route-change + server-side event helper for Route Handlers/Server Actions | v1 (MVP) |
| Vue | `@insightfuel/vue` | Plugin (`app.use(InsightFuel, { apiKey })`); Vue Router integration | v1 (MVP) |
| Static HTML/JS | `@insightfuel/browser` (CDN script) | Drop-in `<script>` tag, zero build step required | v1 (MVP) |
| Angular | `@insightfuel/angular` | Injectable service + Router integration | v1.x |
| Nuxt | `@insightfuel/nuxt` | Module registration, SSR-safe initialization | v1.x |
| Express | `@insightfuel/express` | Middleware for automatic request/response performance + error events, plus server-side `track()` | v1.x |
| Django | `insightfuel-django` | Middleware + management command for setup verification | v1.x |
| Flask | `insightfuel-flask` | Extension pattern (`InsightFuel(app)`) | v1.x |
| Laravel | `insightfuel/laravel` | Service provider + facade | v1.x |
| ASP.NET | `InsightFuel.AspNetCore` | Middleware + DI-registered client | v1.x |
| WordPress | InsightFuel plugin | Admin-panel API key entry, zero code required | v1.x |

Server-side SDKs share a single underlying REST ingestion contract (Architecture doc, Section 15.1), so new language SDKs are thin, low-maintenance wrappers rather than independent implementations.

### 12.3 Client Behavior Requirements

| Requirement | Specification |
|---|---|
| **Batching** | Events buffered client-side and flushed in batches of up to 50 events or every 5 seconds, whichever comes first; forced flush on page unload/visibility change via `sendBeacon`. |
| **Retry** | Failed sends retried with exponential backoff (base 1s, max 30s, max 5 attempts) before an event is considered undeliverable for the current page lifecycle. |
| **Offline mode** | Events generated while offline are queued in persistent local storage (capped at 1,000 events) and flushed automatically on reconnect, detected via the Network Information API / `online` event. |
| **Deduplication** | Every event carries a client-generated `event_id`; the ingestion pipeline deduplicates on this ID within a 24-hour window, making retries and offline-replay safe. |
| **Privacy & consent** | SDK ships with `respectDNT: true` support and explicit `optIn()`/`optOut()` calls; when opted out, the SDK stops all collection and clears any locally queued events. No collection occurs before `init()` is called or while consent is withheld. |
| **Performance** | Gzip bundle size under 15KB for the core browser SDK; asynchronous load pattern that never blocks first paint; all network calls off the main rendering path. |
| **Automatic metadata collection** | Every event is automatically enriched with device type, OS, browser, viewport size, page URL, referrer, SDK version, and session ID — developers never manually attach this context. |

### 12.4 Live Verification

Every SDK integration can be verified in real time via the Developer Dashboard's live event debugger (Section 17.1), which shows events arriving within seconds of being generated — this is the mechanism by which Devon (Section 4.2) confirms a successful integration without waiting for a dashboard to populate historically.

---

## 13. System Architecture Overview

The full system architecture — component diagram, event flow, backend services, data stores, deployment topology, and security architecture — is specified in the companion document **InsightFuel-Architecture.md** and is treated as a normative part of this PRD by reference. This section summarizes the elements most relevant to product requirements traceability.

### 13.1 Processing Pipeline Summary

```
SDK (auto-discovery + manual track/identify)
   → Ingestion API (validate, dedupe, enqueue)
   → Durable Event Queue
   → Ingestion Worker (enrich, PII-scrub, classify into taxonomy category)
   → Event Store (ClickHouse)
   → Feature Intelligence Engine (scheduled recomputation)
   → Product Health Engine (scheduled recomputation)
   → AI Insights Engine (scheduled metric-watcher evaluation)
   → Query API / Dashboards / Power BI / Alerting
```

### 13.2 Where the Three Engines Live

The Feature Intelligence Engine, Product Health Engine, and AI Insights Engine are implemented as scheduled computation jobs (the "Rollup Jobs" service in the Architecture document, Section 5) that read from the Event Store, write computed results into dedicated summary tables, and are what the Query API and dashboards read from directly — dashboards never compute these scores live from raw events, both for latency reasons and so the same score is consistent across every surface that displays it.

### 13.3 Multi-Project Architecture

Every organization can own multiple projects (Section 6.2). Each project is a fully isolated analytical scope: its own event data, its own Feature Registry, its own Product Health Score, and its own API keys. Organization-level views (the portfolio comparison across projects, available to Owners/Admins) aggregate already-computed per-project metrics rather than querying raw events across project boundaries, preserving the tenant-isolation invariant defined in the Architecture document, Section 14.

---

## 14. Data Model

### 14.1 Core Entities

| Entity | Store | Key attributes |
|---|---|---|
| Organization | Postgres | id, name, plan tier, created_at |
| Project | Postgres | id, org_id, name, retention_policy_days, PII scrub rules |
| User (platform account) | Postgres | id, org memberships, role per project |
| API Key | Postgres | id, project_id, type (write / read), created_at, last_used_at |
| Event | ClickHouse | event_id, project_id, distinct_id, event_name, category, timestamp, properties, context |
| Feature Registry entry | Postgres | feature_key, project_id, display_name, first_seen, status (candidate/tracked/suppressed) |
| Feature Metric Snapshot | ClickHouse (summary table) | feature_key, project_id, window, adoption_pct, stickiness, engagement_score, computed_at |
| Product Health Snapshot | Postgres or ClickHouse summary table | project_id, computed_at, composite_score, sub_scores (JSON) |
| AI Insight | Postgres | id, project_id, category, generated_text, supporting_metric_ref, generated_at, severity |
| Dashboard | Postgres | id, project_id, layout, owner, sharing_settings |
| Audit Log Entry | Postgres | id, org_id, actor, action, target, timestamp |

### 14.2 Identity Resolution

Consistent with the Architecture document (Section 7.1 of the Architecture doc — SDK identity handling): every SDK instance generates an anonymous `distinct_id` on first load. A subsequent `identify()` call merges the anonymous history into the identified user's profile. This merge is required for Feature Intelligence and Product Health computations to correctly attribute pre-login behavior (e.g., pre-signup feature exploration) to the eventual identified user.

---

## 15. API Design

InsightFuel's API surface is organized into the same three planes as the Architecture document (Ingestion, Query, Management), with two additions specific to this PRD's scope: the Feature Intelligence API and the Product Health API.

### 15.1 Feature Intelligence API

```
GET /v1/features?project_id=...&window=30d&sort=engagement_score
Authorization: Bearer <read_key>

Response:
{
  "features": [
    {
      "feature_key": "export_report",
      "display_name": "Export Report",
      "adoption_pct": 34.2,
      "growth_pct": -17.0,
      "stickiness": 41.5,
      "engagement_score": 62.8,
      "usage_frequency": 3.4,
      "lifetime_days": 214,
      "rank": 3
    }
  ]
}
```

### 15.2 Product Health API

```
GET /v1/health-score?project_id=...&at=2026-07-13

Response:
{
  "composite_score": 71,
  "trend_7d": +4,
  "sub_scores": {
    "active_users": 78,
    "returning_users": 65,
    "engagement": 70,
    "feature_adoption": 68,
    "retention": 74
  }
}
```

### 15.3 AI Insights API

```
GET /v1/insights?project_id=...&category=feature_adoption_shift&since=2026-07-01

Response:
{
  "insights": [
    {
      "id": "ins_7a12...",
      "category": "feature_adoption_shift",
      "text": "Feature adoption for Export Report dropped by 17% week-over-week (32% -> 15% of active users).",
      "severity": "medium",
      "generated_at": "2026-07-13T06:00:00Z",
      "supporting_metric_ref": "/v1/features/export_report?window=7d"
    }
  ]
}
```

All three APIs are additive extensions of the Query API described in the Architecture document (Section 15.2) and follow the same auth model (read-key, server-side only), rate limiting, and `project_id` scoping enforcement.

---

## 16. Power BI Integration

### 16.1 Principle: Power BI Consumes Metrics, Never Raw Events

Power BI is positioned strictly as a downstream **executive reporting consumer** of already-computed InsightFuel metrics — Feature Intelligence scores, Product Health scores, funnel/retention summaries, AI Insights — never of raw per-user event data. This preserves the platform's PII-scrubbing, consent, and access-control guarantees regardless of which reporting tool an organization layers on top, and keeps Power BI reports fast (querying pre-aggregated metrics, not scanning raw event volume).

```
Event Ingestion → Event Store → Feature Intelligence / Product Health / AI Insights
      (computed, governed metrics)
                     ↓
            Power BI Export Layer
                     ↓
     Power BI (Push Dataset / Scheduled Refresh)
                     ↓
        Executive-facing Power BI Reports
```

### 16.2 Delivery Mechanisms

| Mechanism | Description | When used |
|---|---|---|
| Scheduled metric export | A scheduled job (hourly/daily, configurable) calls the Feature Intelligence, Product Health, and AI Insights APIs and pushes results into a Power BI Push Dataset via the Power BI REST API. | Default for most customers |
| Parquet/CSV export to object storage | Computed metric snapshots are also written to object storage in a Power BI-importable format, for customers whose Power BI workflow uses scheduled file-based refresh rather than push datasets. | Customers with existing file-based BI pipelines |

### 16.3 Governance

Power BI export is scoped by the same read-key/RBAC model as every other API consumer (Architecture doc, Section 11); an organization's Power BI integration can only ever access the projects its configured API key is scoped to, and PII-scrubbing rules applied at ingestion (Section 19) apply identically to data reaching Power BI — there is no bypass path.

---

## 17. Dashboards

Each dashboard is a distinct, role-appropriate surface rather than a single configurable canvas, so that every persona in Section 4 lands on a view matching their actual workflow.

### 17.1 Developer Dashboard
**Primary persona:** Devon (Software Engineer)
**Contents:** Live event debugger (real-time event stream for verification), SDK integration status per framework/package, ingestion error rate, API key management, event volume by category.

### 17.2 Product Dashboard
**Primary persona:** Priya (Product Manager)
**Contents:** Feature Intelligence summary widgets, funnel builder, retention grid, user journey visualization, saved insights.

### 17.3 Executive Dashboard
**Primary persona:** Felix (Founder), executive sponsors generally
**Contents:** Product Health Score (large, prominent, trended), top-line Active/Returning Users, top 3 AI Insights of the week, single-page summary designed to be read in under 60 seconds.

### 17.4 Power BI Dashboard
**Primary persona:** Amir (Data Analyst)
**Contents:** Configuration surface for Power BI export (dataset selection, refresh schedule, push vs. file-export mode), export history/status, not an analytical view itself — this dashboard configures the pipeline described in Section 16.

### 17.5 Feature Intelligence Dashboard
**Primary persona:** Priya, Uma (UX Designer)
**Contents:** Full Feature Registry with all Section 8.2 metrics, ranking table, trend/decline flags, feature drill-down (adoption by segment, usage over time), discovered-candidate feature review queue (Section 8.4).

### 17.6 AI Dashboard
**Primary persona:** All personas, particularly Priya and Grace (Growth)
**Contents:** Chronological, filterable feed of AI Insights Engine output (Section 11), each item linking through to its supporting metric view; configurable delivery preferences (email/Slack) per category and severity.

---

## 18. Security & Compliance

| Control | Specification |
|---|---|
| **RBAC** | Four roles per project — Owner, Admin, Analyst, Viewer — enforced server-side on every API call, not assumed from UI state. |
| **JWT** | Short-lived session JWTs (httpOnly, SameSite=Strict cookie) with rotating refresh tokens for all human dashboard sessions. |
| **API Keys** | Separate write-only (ingestion, safe for client exposure) and read-only (query, server-side only) keys per project; browser-origin requests bearing a read key are rejected as defense-in-depth. |
| **Tenant Isolation** | `project_id` is a mandatory, structurally-enforced predicate at the query-builder layer for every data access path, including Power BI export — never optional or left to be remembered per-query. |
| **Encryption** | TLS 1.2+ in transit everywhere; encryption at rest for all data stores (event store, metadata store, object storage). |
| **PII Scrubbing** | Project-level denylist of property keys dropped or hashed at the ingestion worker before reaching durable storage; raw IP discarded after geo-derivation by default. |
| **Audit Logs** | Append-only log of administrative actions (key rotation, role changes, data export/delete, Power BI configuration changes), queryable by Owners/Admins. |
| **Rate Limiting** | Per-API-key rate limiting at the Gateway for both ingestion and query traffic, with graceful `429`/`Retry-After` responses consumed by SDK-side backoff. |
| **GDPR** | Data export and data deletion APIs scoped to a `distinct_id`, honored within a defined SLA (30 days, batched); consent-aware SDK behavior (Section 12.3) supports lawful-basis requirements. |
| **CCPA** | Same export/delete mechanism serves CCPA "right to know" and "right to delete" requests; "do not sell" is satisfied structurally since InsightFuel does not sell or share customer event data with third parties. |

---

## 19. Privacy Architecture

Privacy is treated as an architectural property, not a policy checkbox layered on afterward — consistent with the "privacy-first architecture" differentiator in Section 3.

- **Data minimization by default:** automatic event discovery captures interaction *patterns* (selector, page context, timing), not free-text field contents; form field values are never captured by default, only the fact that a form was submitted.
- **Consent enforcement is structural:** the SDK will not transmit any event — automatic or manual — before `init()` completes and consent (if `respectDNT`/explicit opt-in is configured) is affirmatively established.
- **PII scrubbing happens before durability:** denylisted/hashed properties never reach the event store in plaintext, consistent with the Architecture document's ingestion-worker design.
- **Configurable retention:** each project sets a maximum raw-event retention window; a scheduled purge job enforces it, while computed summary metrics (Feature Intelligence snapshots, Product Health scores) can be retained longer as aggregated, de-identified history, since these no longer carry per-user identifiable content.
- **Data-subject rights are first-class API operations,** not manual support-ticket processes: export and delete are documented, rate-limited APIs (Section 15) available to project Admins.

---

## 20. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Ingestion p95 latency < 150ms; Query API p95 < 2s for a standard 30-day range; Feature Intelligence and Product Health recomputation complete within their scheduled window (hourly) even at full projected event volume. |
| Availability | Ingestion path 99.9% monthly uptime target; SDK degrades gracefully (local buffering) during backend unavailability, per Section 12.3. |
| Scalability | Architecture must support thousands of concurrent dashboard users and tens of millions of events/day per the companion Architecture document's targets (Architecture doc, Section 15), without a service-boundary rewrite. |
| Data durability | No acknowledged event is lost; ingestion durability guarantee identical to the Architecture document's write-path design (queue-backed before acknowledgment). |
| SDK footprint | Core browser SDK gzip size < 15KB; no main-thread blocking. |
| Explainability | Product Health Score and every AI Insight must be traceable to underlying computed metrics at all times (Sections 9.4, 11.1) — this is treated as a functional requirement, not an aspiration. |
| Multi-tenancy isolation | No query, dashboard, or Power BI export may return or mix data across `project_id` boundaries under any circumstance. |
| Accessibility | All dashboards meet WCAG 2.1 AA for core flows. |

---

## 21. Success Metrics & KPIs

| KPI | Definition | Target |
|---|---|---|
| Time-to-first-insight | Median time from SDK `init()` to first Feature Intelligence output being available | < 24 hours (bounded by minimum-volume threshold in Section 8.4), < 5 minutes for first raw event visibility in the Developer Dashboard |
| SDK integration completion rate | % of new projects that successfully send ≥1 event within 24h of key creation | ≥ 90% |
| Feature Registry accuracy | % of auto-discovered candidate features confirmed/promoted (not suppressed) by customers on review | ≥ 70% (signal that automatic discovery is producing genuinely meaningful features, not noise) |
| AI Insight engagement rate | % of generated insights clicked through to their supporting metric view | ≥ 30% |
| Product Health Score adoption | % of active projects with at least one Executive Dashboard view per week | ≥ 60% |
| Ingestion reliability | Events accepted / events sent by SDKs | ≥ 99.9% |
| Query latency | p95 query response time | < 2s |
| Power BI integration adoption | % of Team/Enterprise-tier projects with an active Power BI export configured | ≥ 25% within 2 quarters of GA |
| Weekly Active Projects | Projects with ≥1 dashboard view/week, tracked as the platform's core engagement metric | Growth trend, tracked quarter over quarter |

---

## 22. Roadmap

### Phase 0 — Foundations (Weeks 1–3)
Repo/service scaffolding, CI/CD, Postgres schema for organizations/projects/users/API keys, Docker Compose dev environment, base authentication.

### Phase 1 — Core Ingestion & Event Taxonomy (Weeks 4–7)
Ingestion API and worker pipeline, event taxonomy classification (Section 7), ClickHouse event schema, Web SDK v0 (React, Next.js, Vue, static) with automatic Navigation/Session/Performance/Error event capture and manual `track()`/`identify()`.

### Phase 2 — Feature Intelligence Engine v1 (Weeks 8–11)
Automatic feature discovery mechanism (Section 8.4), Feature Registry, core feature metrics (Most/Least Used, Adoption %, Engagement Score, Popularity Ranking), Feature Intelligence Dashboard v1.

### Phase 3 — Product Health Engine v1 + Core Analytics (Weeks 12–15)
Product Health Score v1 (five-factor), Event/Feature/Funnel/Retention/Session Analytics (Section 10.1–10.7), Developer and Product Dashboards, Executive Dashboard v1.

### Phase 4 — Privacy, Security, Multi-Project (Weeks 16–18)
RBAC enforcement across all endpoints, PII scrubbing configuration, GDPR/CCPA export-delete APIs, audit logging, multi-project workspace and organization-level portfolio view, load testing against NFR targets (Section 20).

### Phase 5 — v1.x Fast Follow (Weeks 19–24)
Remaining SDK framework coverage (Angular, Nuxt, Express, Django, Flask, Laravel, ASP.NET, WordPress), Feature Intelligence Engine v2 (Trending/Declining, Growth, Stickiness, Usage Frequency, Lifetime), Product Health Engine v2 (nine-factor), Cohort/Device/Browser/Geographic/Traffic Source Analytics, AI Insights Engine v1 (rule-based), Power BI integration, AI Dashboard, Power BI Dashboard.

### Phase 6 — v2 Enterprise Maturity (Weeks 25–32+)
AI Insights Engine v2 (model-assisted detection), Search/Performance/Error Analytics as full capabilities, SSO, advanced audit logging, customer-managed encryption keys, data residency options.

---

## 23. Risks & Open Questions

| Risk / Question | Notes |
|---|---|
| Automatic feature discovery false-positive rate | The minimum-volume threshold (Section 8.4) is a starting heuristic; real-world tuning against pilot customers is required before GA to avoid a noisy Feature Registry undermining trust in the core differentiator. |
| AI Insights Engine v1 threshold tuning | Overly sensitive thresholds produce alert fatigue; overly conservative thresholds miss genuinely actionable shifts — requires a tuning/feedback loop (e.g., a "was this insight useful" signal) before wide rollout. |
| Power BI push-dataset rate limits | Power BI's own API has refresh-frequency and payload constraints that need to be validated against InsightFuel's default hourly export cadence at scale. |
| Product Health Score weight defaults | Default weights (Section 9.2) are a reasonable starting hypothesis, not empirically validated; should be revisited once enough cross-customer data exists to check whether the composite score actually correlates with independently known "healthy" vs. "struggling" products. |
| Mobile SDK timing | Explicitly out of scope for this document's horizon (Section 6.4) — revisit once web-platform coverage and the three core engines are proven. |
| Self-hosted vs. hosted-only | Not resolved in this document; affects how Power BI's direct-database-access mode (if ever offered) would need to be scoped. |

---

## 24. Appendix — Glossary

| Term | Definition |
|---|---|
| **Feature** | A distinct, addressable unit of product capability tracked by the Feature Intelligence Engine, either auto-discovered or manually defined. |
| **Feature Engagement Score** | Composite 0–100 score combining usage frequency, stickiness, and adoption breadth for a single feature (Section 8.3). |
| **Product Health Score** | Composite 0–100 score combining weighted behavioral sub-scores for an entire project (Section 9). |
| **Candidate Feature** | An auto-discovered interaction pattern that has not yet crossed the minimum-volume threshold to be promoted into the Feature Registry. |
| **Stickiness** | Ratio of daily active users of a feature to its trailing 30-day unique user base — analogous to DAU/MAU, scoped to a feature. |
| **Grounded Insight** | An AI Insights Engine output whose every numerical claim is directly traceable to a computed metric, per the constraint in Section 11.1. |
| **Distinct ID** | The identifier — anonymous or identified — used to attribute events to a single user across a session and over time. |
| **Project** | An isolated analytical workspace corresponding to one tracked application, with its own event data, Feature Registry, and Product Health Score. |

---

*End of document.*
