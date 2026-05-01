---
description: How to add k6 load/performance tests for the Pretzel Shop. Use when editing perf/, k6 scripts, or CI perf jobs.
paths:
  - "perf/**/*.js"
  - "k6/**/*.js"
---

# Pretzel Shop — k6 performance tests

## Goal
Measure latency and error rate under load for public API endpoints (products, health). Optionally emit metrics to OTLP when Lesson 9 stack runs.

## Layout
- Store scripts under `perf/k6/` with `.js` extension using k6 **JavaScript** ES module style (`https://grafana.com/docs/k6/latest/using-k6/javascript-typescript-compatibility/`).
- Name scenarios after user journeys: `browse_products.js`, `checkout_happy_path.js`.

## Baseline pattern
- Default target: `BASE_URL` env, e.g. `http://localhost:3001`.
- Use `http.get`/`http.post` with **tags** `name` for each request (helps Grafana dashboards).
- Always set thresholds: `http_req_failed` rate below 1% for smoke, below 0.1% for staging-like; `http_req_duration` p(95) below a budget you document (start with 500ms API, tune with team).

## Stages
- Smoke: 10 VUs, 30s — runs in CI on a self-hosted or thick runner if you add it; on GitHub-hosted, keep very light or mark as nightly only.
- Load: ramp 30s → hold 2m → ramp down — **never** run full load against production without approval.

## OTLP (optional, Lesson 9)
- When running locally with observability stack, pass:
  - `K6_OTLP_GRPC_EXPORTER_INSECURE=true`
  - `K6_OTLP_GRPC_EXPORTER_ENDPOINT=localhost:4317` (or the collector address)
- Service name: `k6-pretzel-shop`.

## Data safety
- Do not load-test third-party payment APIs.
- Use synthetic emails and IDs only.

## Output
- Prefer `handleSummary` to emit a short JSON summary file for CI artifacts when needed.

## Commands
- Local: `k6 run perf/k6/browse_products.js`
- Docker: `docker run --rm -i -e BASE_URL=http://host.docker.internal:3001 grafana/k6:1.7.1 run - <perf/k6/browse_products.js`

## What not to do
- Do not hardcode 50k VUs in a script committed to main — parameterize `VUS` and `DURATION` via env with safe defaults.