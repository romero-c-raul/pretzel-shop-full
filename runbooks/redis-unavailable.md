# Runbook: Redis unavailable (cart failures)

## Scope

Redis is down, unreachable, or refusing connections. Symptoms concentrate on **cart** routes (`/api/cart`). Product catalog (`/api/products`) may still work.

This runbook does **not** cover: application bugs in cart logic, Redis memory eviction tuning, or Redis cluster failover.

**Note:** `/health` does not check Redis. It returns 200 while cart is broken — do not use it to rule out this failure mode.

## Symptoms

- `POST /api/cart` or `GET /api/cart` return errors or fail silently.
- Browser: cart does not load; add-to-cart fails. Product pages may still load.
- Logs: `Redis Client Error`, `ConnectionTimeout`, `Connection timeout`.

## Severity

- **Local / dev:** Continue alone; restore Redis container.
- **Production:** Customer-impacting for checkout and cart. Escalate if mitigation does not restore cart within SLO window or if root cause is unclear.

## Prerequisites

- Grafana at `http://192.168.56.2:3000`.
- Prometheus, Loki, Tempo datasources provisioned.
- Container name: `pretzel-shop-full-redis-1`.

## Local quick checks

```bash
docker compose ps
```

```bash
curl -s -o /dev/null -w "health %{http_code}\n" http://192.168.56.2:3001/health
curl -s -o /dev/null -w "products %{http_code}\n" http://192.168.56.2:3001/api/products
curl -s -o /dev/null -w "cart %{http_code}\n" http://192.168.56.2:3001/api/cart
```

If Redis is down: health and products may return 200 while cart fails.

## Grafana

Open **Pretzel Shop — Golden Signals** (`http://192.168.56.2:3000`).

With low traffic volume, the dashboard panels may not show a visible spike — the signal drowns in scale. **Check Loki first** in low-traffic environments.

### Prometheus (Explore)

Request rate by route — check if cart traffic is still hitting the backend:

```promql
sum by (http_route) (rate(otel_http_server_duration_milliseconds_count[5m]))
```

Global error ratio:

```promql
sum(rate(otel_http_server_duration_milliseconds_count{http_status_code=~"5.."}[5m]))
  /
sum(rate(otel_http_server_duration_milliseconds_count[5m]))
```

### Loki (Explore)

Redis connection errors — this is the most reliable signal in low-traffic environments:

```logql
{service_name="pretzel-backend"} |= "Redis"
```

Cart-specific errors:

```logql
{service_name="pretzel-backend"} |= "ConnectionTimeout"
```

Broad error sweep:

```logql
{service_name="pretzel-backend"} |~ `(?i)error`
```

### Tempo (Explore)

- Service name: `pretzel-backend`.
- Filter by time range when cart errors appeared.
- Use Trace to logs to jump from a failed trace to the matching Loki lines.

## Mitigation

Start Redis:

```bash
docker start pretzel-shop-full-redis-1
```

If the container is missing entirely:

```bash
docker compose -f docker-compose.yml up -d redis
```

## Verification

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://192.168.56.2:3001/api/cart
```

Expect **200**. Confirm error lines stop appearing in the Loki panel.

## After mitigation

- [ ] File an RCA in `rcas/` if this was customer-impacting.
- [ ] Consider adding `/ready` endpoint that pings Redis — `/health` returning 200 during this failure is a known gap.
- [ ] Update this runbook if metric names change after an OTel SDK bump.

## Related links

- `docker-compose.yml` — Redis service definition.
- `../rcas/` — incident records.
