# Runbook: [short title]

## Scope

What this runbook covers. What it explicitly does **not** cover (point to another file).

## Symptoms

- User-visible: …
- Metrics/logs: …

## Severity

- When to continue alone: …
- When to escalate: …

## Prerequisites

- Observability stack running (see course Lesson 9): Grafana, Prometheus, Loki, Tempo.
- Backend service name in traces: `pretzel-backend` (set via `OTEL_SERVICE_NAME`).

## Local quick checks

```bash
# Example: list Pretzel-related containers
docker ps -a --filter name=pretzel
```

```bash
# Example: API smoke
curl -s -o /dev/null -w "%{http_code}\n" http://192.168.56.2:3001/health
```

## Grafana

1. Open dashboard: **Pretzel Shop — Golden Signals** (or your equivalent).
2. Note which golden signal moved first: latency, traffic, errors, saturation.

### Prometheus (Explore)

Paste and adjust metric names to match your OpenTelemetry version:

```promql
# placeholder — replace with verified series
up
```

### Loki (Explore)

Start with a **narrow** label set (avoid `{job="docker"}` alone on large hosts):

```logql
{service_name="pretzel-backend"} |~ `(?i)error`
```

### Tempo (Explore)

Search: `service.name = pretzel-backend`. Open slow or error traces; use trace-to-logs if configured.

## Mitigation

Ordered steps. One command per block.

## Verification

How you know service is restored. Include `curl` or UI checks.

## After mitigation

- [ ] Open or update RCA in `rcas/` if customer-impacting or mandated by policy.
- [ ] Create tickets for action items (alerts, code, readiness checks).