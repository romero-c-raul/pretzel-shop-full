# RCAs (Root Cause Analyses)

RCAs are historical records of specific incidents or drills — not reusable checklists. For reusable investigation steps, see `../runbooks/`.

## Naming

```
YYYY-MM-DD-<short-slug>.md
```

Examples:
- `2026-05-18-local-drill-redis-cart-outage.md`
- `2026-05-18-local-drill-postgres-products-outage.md`

## Tone

Blameless. Focus on systems and processes, not people. An RCA identifies what safeguard was missing, not who made the mistake. Blame-heavy RCAs cause engineers to omit steps and soften timelines — the document becomes fiction and you learn nothing.

## Required sections

Every RCA must include:
- Title and metadata (date, environment, type)
- Executive summary
- Impact
- Timeline (UTC timestamps)
- Detection
- Investigation (with exact PromQL/LogQL queries used)
- Root cause
- Resolution
- Action items (checkboxes with owners)
- Links to relevant runbooks

## On queries and URLs

**Queries are required. URLs are optional.** Grafana bookmark URLs break when dashboards are reorganized. The PromQL and LogQL you actually ran must appear in the RCA as text — so the investigation is reproducible without Grafana history.

Local drill RCAs may reference `http://192.168.56.2:3000`. Production teams substitute their real Grafana base URL or omit it entirely and keep queries only.

## On timing

Draft the RCA during or immediately after the incident. Even bullet notes beat memory. Timelines written days later become fiction.
