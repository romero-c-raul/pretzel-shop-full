---
description: How to add and maintain integration tests for the Pretzel Shop Express API (Supertest + node:test). Use when editing backend tests, server.js, or routes.
paths:
  - "backend/**/*.js"
  - "backend/**/*.test.js"
  - "backend/test/**"
---

# Pretzel Shop — integration tests

## Goal
Prove HTTP routes work against a real PostgreSQL and Redis (Docker Compose), not mocks.

## Stack
- Test runner: Node.js built-in `node:test` (import from `node:test` and `node:assert`).
- HTTP: `supertest` against the Express `app` export — do not listen on a random port unless `server.js` is refactored to export `app` without calling `listen()` in test mode.

## Required layout
- Put tests under `backend/test/integration/` with suffix `.test.js`.
- Add npm script: `"test": "node --test test/"` or `"test:integration": "node --test test/integration"` if you split unit vs integration.

## Refactor rule (critical)
If `server.js` only calls `app.listen` at top level, add:
- `module.exports = { app };` after `app` is fully configured.
- Wrap `listen` in `if (require.main === module) { app.listen(...) }` so tests can `require('../server')` or import `app` from a small `app.js` module. Prefer extracting `createApp()` in `app.js` and keeping `server.js` as the entrypoint — ask the human before large refactors.

## Environment
- Tests must read `process.env.DATABASE_URL` and Redis URL from env; never hardcode production hosts.
- Document in `backend/README.md`: start Compose (`docker compose up -d postgres redis`), run migrations (`npm run migrate`), then `npm run test:integration`.

## Data discipline
- Use a dedicated test database name or schema if available; if not, truncate tables in `before`/`after` hooks using the same `pg` pool as the app — only against local dev DB.
- Never point integration tests at production.

## Assertions
- Every route test must assert **status code** and at least one **shape** property (e.g. array length, required field).
- For cart and orders, cover happy path + one failure (empty body, invalid id).

## OpenTelemetry (Lesson 9)
- When `OTEL_EXPORTER_OTLP_ENDPOINT` is set, tests should not crash if the collector is down; SDK must use short timeout or no-op exporter fallback. Do not block test merge on OTLP availability.

## What not to do
- Do not add Jest unless the repo already standardized on Jest — this course uses `node:test`.
- Do not mock `pg` or `redis` in files under `test/integration/` — that defeats the purpose.