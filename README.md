# Command Center OS — Master Package

Open `COMMAND_OS_BACKEND/MASTER_README.md` for the full developer handoff.

## Folder map
- `COMMAND_OS_BACKEND/`  — FastAPI + Postgres + Redis + AI Brain. Read the MASTER_README inside.
- `frontend/`            — single-file CommandOS HTML dashboard + `api_client.js` adapter.
- `_research_cache/`     — `tasks_seed.json` consumed by the seeder.
- `screenshots/`         — 20 reference UI screenshots.
- `reference/`           — strategic docs (90-day plan, feature documentation, master index).

## 5-minute start
```
cd COMMAND_OS_BACKEND
cp .env.example .env       # add ANTHROPIC_API_KEY (optional for AI Brain)
docker compose up -d
docker compose exec api python seed_from_existing.py
open http://localhost:8765/docs
open ../frontend/CommandOS.html
# Login: gaurav / ceo123
```

## Hosting
See `COMMAND_OS_BACKEND/DEPLOYMENT_GUIDE.md`.
TL;DR: Railway.app, ~£8–14/month, 30-min deploy.
