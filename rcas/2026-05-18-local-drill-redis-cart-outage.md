# RCA: Local drill — Redis unavailable, cart API failing

- **Date:** 2026-05-18
- **Environment:** Local developer machine (Docker Compose on VM at 192.168.56.2)
- **Type:** Scheduled learning drill (not production)
- **Runbook:** `../runbooks/redis-unavailable.md`

## Executive summary

During a local outage drill the `pretzel-shop-full-redis-1` container was stopped while the backend remained running. Cart endpoints became unavailable; product catalog continued responding. Loki showed `Redis Client Error ConnectionTimeout` immediately. The dashboard latency panel showed `/api/cart` p95 at ~10,000ms (connection timeout hanging before returning error). Mitigation was `docker start pretzel-shop-full-redis-1`. Follow-ups focus on the shallow `/health` endpoint and the low-traffic dashboard visibility gap.

## Impact

- **Users (simulated):** Cart read/write unavailable. Product browsing unaffected.
- **Duration:** ~8 minutes (controlled drill).
- **Revenue / SLA:** N/A (local drill).

## Timeline (UTC)

- **~18:40** — Baseline k6 traffic run: health and products, 100% success, p95 < 50ms.
- **~18:57** — `docker stop pretzel-shop-full-redis-1` executed.
- **~18:57** — Cart curl loop started (`POST /api/cart`). Backend logs immediately show `Redis Client Error ConnectionTimeout`.
- **~18:58** — Dashboard latency panel: `/api/cart` p95 climbs to ~10,000ms.
- **~19:00** — Investigation: Loki panel shows Redis connection errors. Error rate panel flat due to low traffic volume and scale issue (see investigation notes).
- **~19:04** — Hypothesis confirmed: `docker compose ps` shows `pretzel-shop-full-redis-1` absent.
- **~19:05** — `docker start pretzel-shop-full-redis-1` executed.
- **~19:05** — Cart `GET /api/cart` returns 200. Latency drops to baseline.

## Detection

- Synthetic: `curl` loop to `POST /api/cart` after Redis stop.
- **Grafana dashboard:** `http://192.168.56.2:3000` — **Pretzel Shop — Golden Signals**.
- Loki panel (dashboard) showed `Redis Client Error ConnectionTimeout` within one scrape interval.

## Investigation

### Golden signals (dashboard)

- **Latency:** `/api/cart` p95 spiked to ~10,000ms — Redis connection timeout hanging before failing.
- **Traffic:** Cart requests still hitting backend (process alive, dependency dead).
- **Errors:** Error rate panel stayed visually flat despite real failures. Root cause: low traffic volume (20 curl requests) diluted across the 5-minute rate window on a 0–100% y-axis scale. Dashboard error rate is most useful at production traffic volumes.
- **Key observation:** `/health` returned 200 throughout. Load balancers using only `/health` would have continued routing traffic to a broken instance.

### Prometheus (Explore)

Datasource: **Prometheus** — `http://192.168.56.2:3000/explore`

Request rate by route:

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

Datasource: **Loki** — `http://192.168.56.2:3000/explore`

This was the most reliable signal during this drill due to low traffic volume.

```logql
{service_name="pretzel-backend"} |= "Redis"
```

```logql
{service_name="pretzel-backend"} |= "ConnectionTimeout"
```

### Tempo (Explore)

Datasource: **Tempo** — `http://192.168.56.2:3000/explore`

- Service name: `pretzel-backend`.
- Traces for cart requests during the failure window showed ~10,000ms duration (connection timeout).
- Trace-to-logs configured; clicking a span jumps to Loki lines at the same timestamp.

## Root cause

`pretzel-shop-full-redis-1` was intentionally stopped. The backend process continued running; cart route handlers depend on Redis and returned errors after connection timeout. The `/health` endpoint has no Redis dependency check and returned 200 throughout the outage.

## Resolution

```bash
docker start pretzel-shop-full-redis-1
```

Verified with:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://192.168.56.2:3001/api/cart
```

Returned **200**.

## Action items

- [ ] Add `/ready` endpoint that pings Redis — separate from `/health`. Load balancers should use `/ready`, not `/health`.
- [ ] Fix error rate panel unit to `percentunit` so low-traffic failures register visually (currently 0–100 scale makes small ratios invisible).
- [ ] Update `runbooks/redis-unavailable.md` when OTel SDK is bumped and metric names change.
- [ ] Repeat drill quarterly with a different failure class; add new RCA file each time.

## References

- `../runbooks/redis-unavailable.md`
