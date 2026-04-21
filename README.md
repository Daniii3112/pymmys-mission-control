# Pymmys Mission Control

> AI agent orchestration headquarters — manage, monitor, and direct your entire agent fleet in real time.

Premium dark SaaS dashboard with a real FastAPI + SQLite backend.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Zustand (polled from API) |
| Icons | Lucide React |
| Backend | FastAPI 0.111+ |
| Database | SQLite via SQLAlchemy 2 |
| Server | Uvicorn |

---

## Quick Start

### 1 — Backend

```bash
# Install Python deps (once)
pip install -r requirements.txt

# Start the FastAPI server (auto-seeds on first run)
uvicorn backend.main:app --reload --port 8000
```

The backend seeds 8 agents, 4 missions, 12 tasks, and 8 activity events on first start, then immediately begins generating live activity and incrementing task progress via a background thread.

### 2 — Frontend

```bash
npm install
npm run dev        # requires Node.js 18+
```

Open [http://localhost:3000](http://localhost:3000) → auto-redirects to `/dashboard`.

### 3 — Environment

Copy `.env.local` if you change the backend port:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Architecture (Phase 1)

```
┌─────────────────────────────────────┐     HTTP polling (3-4s)
│  Next.js Frontend (port 3000)       │ ◄──────────────────────►  ┌──────────────────────────┐
│                                     │                            │  FastAPI Backend (8000)  │
│  Zustand store                      │   GET /agents              │                          │
│  ├── agents[]                       │   GET /missions            │  /agents                 │
│  ├── missions[]                     │   GET /activity            │  /missions (+ tasks)     │
│  ├── tasks[]                        │   GET /system/summary      │  /activity               │
│  └── activity[]                     │   POST /missions           │  /system/summary         │
│                                     │   POST /agents/{id}/run    │  /agents/{id}/run        │
│  lib/api.ts                         │                            │                          │
│  ├── fetchAgents()                  │                            │  SQLite DB               │
│  ├── fetchMissionsWithTasks()       │                            │  ├── agents              │
│  ├── fetchActivity()                │                            │  ├── missions            │
│  └── fetchSystemSummary()           │                            │  ├── tasks               │
│                                     │                            │  └── activity_events     │
│  All visual components unchanged    │                            │                          │
│  (read same Zustand store shape)    │                            │  Background simulator    │
│                                     │                            │  ├── activity events/4s  │
└─────────────────────────────────────┘                            │  └── task progress/2s    │
                                                                   └──────────────────────────┘
```

### Data flow

1. `Shell` mounts → calls `startPolling()`
2. Two staggered `setTimeout` loops fire:
   - **Agents + Missions loop** every 3s: `GET /agents` + `GET /missions` in parallel
   - **Activity loop** every 4s (offset 1s): `GET /activity?limit=100`
3. Each response is parsed (ISO strings → `Date` objects) and written to Zustand
4. All components re-render from the same store shape — zero component changes required
5. If backend is unreachable, a banner appears and stale data stays visible

### Backend simulator

Runs as a daemon thread inside the FastAPI process:
- Rotates through 20 realistic activity messages, writes one to SQLite every ~4s
- Increments all `running` task progress by 0.5–2.5% every 2s
- Recomputes parent mission progress from task averages
- Updates agent `last_seen` timestamps

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/agents` | All agents with status, metrics, position |
| `GET` | `/missions` | All missions with embedded tasks |
| `GET` | `/activity?limit=N` | Activity events, newest first |
| `GET` | `/system/summary` | Aggregated system KPIs |
| `POST` | `/missions` | Create a new mission |
| `POST` | `/agents/{id}/run` | Activate an agent (sets status → busy) |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger UI |

---

## Project Structure

```
backend/
  main.py           # FastAPI app, CORS, lifespan (seed + simulator)
  database.py       # SQLAlchemy engine + session factory
  models.py         # ORM models (Agent, Mission, Task, ActivityEvent)
  schemas.py        # Pydantic response schemas (mirror TS types exactly)
  seed.py           # Initial data seeder (runs once on empty DB)
  simulator.py      # Background thread: live activity + task progress
  routers/
    agents.py       # GET /agents, POST /agents/{id}/run
    missions.py     # GET /missions, POST /missions
    activity.py     # GET /activity
    system.py       # GET /system/summary

lib/
  api.ts            # Typed fetch client + ISO→Date parsers
  store/index.ts    # Zustand store — now polls API via startPolling()

app/
  layout.tsx        # Root layout with Shell
  dashboard/        # KPI cards, mission list, agent fleet, activity feed
  agents/           # Agent fleet grid + inspector panel
  mission-control/  # SVG HQ map, task connections, inspector, live ticker
  activity/         # Full event stream

components/         # All unchanged — read same Zustand store shape
  layout/shell.tsx  # Starts startPolling(), shows loading/error state
  ...
```
