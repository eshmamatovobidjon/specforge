---
id: fix-health-endpoint-false-positive
title: Fix /health returning 200 when database is unreachable
mode: nano
status: stable
created: 2026-01-22
updated: 2026-01-22
author: specforge-core
---

# Fix /health returning 200 when database is unreachable

## What & why
The `/health` endpoint returns HTTP 200 and `{"status":"ok"}` regardless of
whether the database connection is alive. Downstream load balancers and uptime
monitors rely on this endpoint to determine service health — a false positive
means broken deployments pass health checks silently and receive live traffic.

## Change contract
- [ ] When the database connection check succeeds, `/health` returns HTTP 200 with `{"status":"ok","db":"up"}`
- [ ] When the database connection check fails, `/health` returns HTTP 503 with `{"status":"degraded","db":"down","error":"<message>"}`
- [ ] The endpoint responds within 500ms under normal conditions (the DB check must have a timeout)

## Scope boundary
- NOT changing: authentication or authorisation on the `/health` route
- NOT changing: the route path itself (`/health` stays as-is)
- NOT changing: any other field in the health response beyond `status` and the new `db` field

## Verification
Hit `/health` with the database stopped locally and confirm the response is
HTTP 503 with `"db":"down"`; restart the database and confirm it returns
HTTP 200 with `"db":"up"`.

---
<!-- Status flow: draft → in-progress → stable → deprecated -->