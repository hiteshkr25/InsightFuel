# InsightFuel Platform

InsightFuel is an enterprise-grade SaaS Product Analytics & AI-Driven Recommendation Platform.

---

## Running in Demo Mode

Demo Mode allows the platform to run without requiring a live Kafka cluster, ClickHouse instance, or background event processor queues, making local onboarding and client presentations near-instant.

1. Set the environment variable:
   ```bash
   DEMO_MODE=true
   ```
2. Start the local database (PostgreSQL for metadata) and Redis:
   ```bash
   docker-compose up -d postgres redis
   ```
3. Start the microservices and dashboard app:
   ```bash
   pnpm run dev
   ```

---

## Running in Production Mode

Production Mode routes ingestion traffic through Kafka and persists analytics events into ClickHouse.

1. Ensure the demo mode setting is disabled (default):
   ```bash
   DEMO_MODE=false
   ```
2. Start the entire datastore stack:
   ```bash
   docker-compose up -d
   ```
3. Boot the API Gateway, Ingestion service, Event Processor worker, and Analytics pipelines.