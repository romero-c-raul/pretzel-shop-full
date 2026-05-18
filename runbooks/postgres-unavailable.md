# Runbook: PostgreSQL unavailable

## Scope

PostgreSQL is down, unreachable, or refusing connections. **Products** and **orders** routes fail. Cart may still work (Redis-backed). This runbook does **not** cover slow queries, connection pool exhaustion, or disk-full on Postgres.

**Note:** `/health` does not check Postgres. It may return 200 while products are broken.

## Symptoms

- `GET /api/products` returns 500 (`Error fetching products`).
- Latency spikes to several seconds before requests fail — Postgres connection timeout is slow to fire.
- Logs: `Error fetching products`, `Connection terminated unexpectedly`, `Connection terminated due to connection timeout`, stack trace through `pg-pool` and `products.js`.

## Severity

- **Local / dev:** Restore Postgres container; re-run migrations if volume was lost.
- **Production:** High — catalog and orders down. Escalate if database does not recover or failover is required.

## Prerequisites

- Grafana at `http://192.168.56.2:3000`.
- Prometheus, Loki, Tempo datasources provisioned.
- Container name: `pretzel-shop-full-postgres-1`.

## Local quick checks

```bash
docker compose ps
```

```bash
curl -s -o /dev/null -w "health %{http_code}\n" http://192.168.56.2:3001/health
curl -s -o /dev/null -w "products %{http_code}\n" http://192.168.56.2:3001/api/products
```

Note: `/health` may return 200 while products are broken.

## Grafana

Open **Pretzel Shop — Golden Signals** (`http://192.168.56.2:3000`).

Unlike Redis failures, Postgres failures produce visible dashboard signals even at low traffic volume — requests hang on connection timeout (10+ seconds) before returning 500, which drives up both latency and error rate.

**What to look for:**
- Latency panel: `/api/products` p90/p95 spikes to seconds
- Error rate panel: jumps visibly (Postgres timeout produces sustained 500s)
- Loki panel: `Error fetching products` lines appear

### Prometheus (Explore)

Global error ratio:

```promql
sum(rate(otel_http_server_duration_milliseconds_count{http_status_code=~"5.."}[5m]))
  /
sum(rate(otel_http_server_duration_milliseconds_count[5m]))
```

Request rate by route — identify which routes are affected:

```promql
sum by (http_route) (rate(otel_http_server_duration_milliseconds_count[5m]))
```

### Loki (Explore)

Products-specific errors:

```logql
{service_name="pretzel-backend"} |= "fetching products"
```

Broader database errors:

```logql
{service_name="pretzel-backend"} |= "Connection terminated"
```

Broad error sweep:

```logql
{service_name="pretzel-backend"} |~ `(?i)error`
```

### Tempo (Explore)

- Service name: `pretzel-backend`.
- Filter span name: `GET /api/products`.
- Traces during a Postgres outage show 10-13 second durations — the connection timeout hanging before returning 500.
- Use Trace to logs to jump from a slow trace to the matching Loki lines.

## Mitigation

Start Postgres:

```bash
docker start pretzel-shop-full-postgres-1
```

Wait for healthcheck to pass before declaring victory:

```bash
until docker exec pretzel-shop-full-postgres-1 pg_isready -U pretzel_user; do sleep 2; done
```

If the container is missing entirely:

```bash
docker compose -f docker-compose.yml up -d postgres
```

If data volume was lost, re-run migrations per `backend/README.md`.

## Verification

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://192.168.56.2:3001/api/products
```

Expect **200**. Confirm latency and error rate drop in Grafana.

## After mitigation

- [ ] File an RCA in `rcas/` if this was customer-impacting.
- [ ] Consider adding `/ready` endpoint that checks Postgres — `/health` returning 200 during this failure is a known gap.
- [ ] Track follow-ups: connection pool metrics, `postgres_exporter` for USE-method saturation signals.
- [ ] Update this runbook if metric names change after an OTel SDK bump.

## Related links

- `docker-compose.yml` — Postgres service definition.
- `backend/config/database.js` — connection pool configuration.
- `../rcas/` — incident records.

