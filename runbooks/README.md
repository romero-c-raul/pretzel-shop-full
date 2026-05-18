# Runbooks

Runbooks are reusable checklists for specific failure classes — not incident timelines. Each file covers one failure mode: what symptoms to expect, which signals to check, and how to restore service.

For a historical record of a specific incident, see `../rcas/`.

## Index

| Runbook | Symptom covered |
|---|---|
| [redis-unavailable.md](redis-unavailable.md) | Cart endpoints failing; Redis connection errors in logs |
| [postgres-unavailable.md](postgres-unavailable.md) | Products and orders failing; Postgres connection errors in logs |

## Conventions

- Copy `TEMPLATE.md` when adding a new failure class. One file per failure class.
- Grafana base URL in this repo is `http://192.168.56.2:3000` (dev VM). Production teams substitute their real base URL or internal shortlink.
- **PromQL and LogQL queries are the source of truth** — not Grafana bookmark URLs. URLs break when dashboards are reorganized. Queries don't.
- When OTel SDK versions are bumped, update metric names in runbooks in the same PR. Current metric prefix: `otel_http_server_duration_milliseconds_*`.
- Container names follow the Compose project name `pretzel-shop-full`: `pretzel-shop-full-redis-1`, `pretzel-shop-full-postgres-1`, `pretzel-shop-full-backend-1`.
