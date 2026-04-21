"""Seed the database with realistic initial data.
Called on startup if the DB tables are empty.
"""

import json
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from .models import AgentModel, MissionModel, TaskModel, ActivityEventModel


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ago(seconds: int) -> str:
    return (datetime.now(timezone.utc) - timedelta(seconds=seconds)).isoformat()


def _future(seconds: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat()


# ─── Agents ───────────────────────────────────────────────────────────────────

AGENTS = [
    {
        "id": "agent-orchestrator",
        "name": "Pymmys Core",
        "role": "orchestrator",
        "status": "online",
        "avatar": "🧠",
        "color": "#818cf8",
        "description": "Central orchestrator. Decomposes goals into tasks and dispatches to specialist agents.",
        "capabilities": ["planning", "delegation", "context management", "error recovery"],
        "tasks_completed": 1247,
        "tasks_active": 3,
        "success_rate": 97.0,
        "avg_latency_ms": 420,
        "token_usage": 8_420_000,
        "position_x": 50.0,
        "position_y": 45.0,
        "department": "Command",
    },
    {
        "id": "agent-researcher",
        "name": "Nexus",
        "role": "researcher",
        "status": "busy",
        "avatar": "🔍",
        "color": "#22d3ee",
        "description": "Deep research agent. Retrieves, synthesizes, and verifies information from diverse sources.",
        "capabilities": ["web search", "document analysis", "fact verification", "summarization"],
        "tasks_completed": 892,
        "tasks_active": 2,
        "success_rate": 94.0,
        "avg_latency_ms": 1800,
        "token_usage": 5_100_000,
        "position_x": 20.0,
        "position_y": 25.0,
        "department": "Intelligence",
    },
    {
        "id": "agent-coder",
        "name": "Forge",
        "role": "coder",
        "status": "busy",
        "avatar": "⚡",
        "color": "#f59e0b",
        "description": "Full-stack engineering agent. Writes, refactors, and debugs production-quality code.",
        "capabilities": ["code generation", "debugging", "refactoring", "testing", "code review"],
        "tasks_completed": 2104,
        "tasks_active": 1,
        "success_rate": 91.0,
        "avg_latency_ms": 2400,
        "token_usage": 12_300_000,
        "position_x": 78.0,
        "position_y": 25.0,
        "department": "Engineering",
    },
    {
        "id": "agent-writer",
        "name": "Scribe",
        "role": "writer",
        "status": "online",
        "avatar": "✍️",
        "color": "#10b981",
        "description": "Content & communications agent. Drafts copy, docs, reports, and narratives.",
        "capabilities": ["copywriting", "documentation", "technical writing", "tone adaptation"],
        "tasks_completed": 653,
        "tasks_active": 0,
        "success_rate": 98.0,
        "avg_latency_ms": 900,
        "token_usage": 3_800_000,
        "position_x": 20.0,
        "position_y": 68.0,
        "department": "Communications",
    },
    {
        "id": "agent-analyst",
        "name": "Prism",
        "role": "analyst",
        "status": "busy",
        "avatar": "📊",
        "color": "#a78bfa",
        "description": "Data analytics agent. Processes datasets, finds patterns, and generates insights.",
        "capabilities": ["data analysis", "statistical modeling", "visualization", "reporting"],
        "tasks_completed": 447,
        "tasks_active": 2,
        "success_rate": 96.0,
        "avg_latency_ms": 3100,
        "token_usage": 2_900_000,
        "position_x": 78.0,
        "position_y": 68.0,
        "department": "Analytics",
    },
    {
        "id": "agent-reviewer",
        "name": "Sentinel",
        "role": "reviewer",
        "status": "idle",
        "avatar": "🛡️",
        "color": "#f43f5e",
        "description": "Quality assurance agent. Reviews outputs for accuracy, safety, and policy compliance.",
        "capabilities": ["quality control", "fact-checking", "policy review", "risk assessment"],
        "tasks_completed": 1589,
        "tasks_active": 0,
        "success_rate": 99.0,
        "avg_latency_ms": 640,
        "token_usage": 6_700_000,
        "position_x": 50.0,
        "position_y": 78.0,
        "department": "QA",
    },
    {
        "id": "agent-planner",
        "name": "Blueprint",
        "role": "planner",
        "status": "online",
        "avatar": "🗺️",
        "color": "#fb923c",
        "description": "Strategic planning agent. Creates roadmaps, estimates, and execution plans.",
        "capabilities": ["project planning", "estimation", "roadmapping", "dependency analysis"],
        "tasks_completed": 318,
        "tasks_active": 1,
        "success_rate": 95.0,
        "avg_latency_ms": 1100,
        "token_usage": 1_900_000,
        "position_x": 35.0,
        "position_y": 45.0,
        "department": "Strategy",
    },
    {
        "id": "agent-executor",
        "name": "Axiom",
        "role": "executor",
        "status": "busy",
        "avatar": "🚀",
        "color": "#06b6d4",
        "description": "Action execution agent. Runs tools, APIs, and automations with precision.",
        "capabilities": ["tool use", "API calls", "browser automation", "workflow execution"],
        "tasks_completed": 3411,
        "tasks_active": 4,
        "success_rate": 89.0,
        "avg_latency_ms": 580,
        "token_usage": 18_900_000,
        "position_x": 65.0,
        "position_y": 45.0,
        "department": "Operations",
    },
]

# ─── Missions & Tasks ─────────────────────────────────────────────────────────

MISSIONS_AND_TASKS = [
    {
        "mission": {
            "id": "mission-001",
            "name": "Project Nightfall",
            "description": "Full competitive intelligence sweep on Series A SaaS competitors.",
            "status": "active",
            "objective": "Deliver a comprehensive 40-page competitive analysis with product comparisons, pricing intel, and strategic recommendations.",
            "agent_ids": ["agent-orchestrator", "agent-researcher", "agent-analyst", "agent-writer", "agent-reviewer"],
            "created_at": _ago(3_600),
            "deadline": _future(7_200),
            "progress": 62.0,
            "tags": ["research", "competitive-intel", "high-priority"],
        },
        "tasks": [
            {
                "id": "task-001", "title": "Scrape competitor pricing pages",
                "description": "Extract pricing tiers, features, and CTAs from 12 competitor websites.",
                "status": "completed", "priority": "high",
                "assigned_agent_id": "agent-executor", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(3_500), "started_at": _ago(3_400), "completed_at": _ago(3_100),
                "progress": 100.0, "output": "Collected pricing data from 12 competitors. CSV exported.",
                "tags": ["scraping", "pricing"],
            },
            {
                "id": "task-002", "title": "Deep-dive research on top 5 competitors",
                "description": "Analyze product roadmaps, customer reviews, job postings, and press releases.",
                "status": "running", "priority": "critical",
                "assigned_agent_id": "agent-researcher", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(3_400), "started_at": _ago(2_800),
                "progress": 68.0, "tags": ["research", "competitive"],
            },
            {
                "id": "task-003", "title": "Statistical market share analysis",
                "description": "Run regression on publicly available market data to estimate share distribution.",
                "status": "running", "priority": "high",
                "assigned_agent_id": "agent-analyst", "from_agent_id": "agent-researcher",
                "created_at": _ago(2_000), "started_at": _ago(1_800),
                "progress": 42.0, "tags": ["analysis", "statistics"],
            },
            {
                "id": "task-004", "title": "Draft executive summary",
                "description": "Write a 3-page exec summary from research findings.",
                "status": "queued", "priority": "high",
                "assigned_agent_id": "agent-writer", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(1_000), "progress": 0.0, "tags": ["writing", "summary"],
            },
            {
                "id": "task-005", "title": "Review and fact-check full report",
                "description": "Verify all claims, statistics, and recommendations for accuracy.",
                "status": "queued", "priority": "high",
                "assigned_agent_id": "agent-reviewer", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(900), "progress": 0.0, "tags": ["qa", "review"],
            },
        ],
    },
    {
        "mission": {
            "id": "mission-002",
            "name": "Codebase Refactor",
            "description": "Migrate legacy Express API to modern Next.js 16 with full TypeScript coverage.",
            "status": "active",
            "objective": "Refactor 47 endpoints, add type safety, write unit tests, and ensure zero regression.",
            "agent_ids": ["agent-orchestrator", "agent-coder", "agent-reviewer", "agent-executor"],
            "created_at": _ago(86_400),
            "progress": 34.0,
            "tags": ["engineering", "refactor", "backend"],
        },
        "tasks": [
            {
                "id": "task-006", "title": "Audit existing Express endpoints",
                "description": "Document all 47 endpoints, their contracts, and identify type coverage gaps.",
                "status": "completed", "priority": "high",
                "assigned_agent_id": "agent-coder", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(86_000), "started_at": _ago(85_000), "completed_at": _ago(72_000),
                "progress": 100.0, "tags": ["audit", "typescript"],
            },
            {
                "id": "task-007", "title": "Migrate /api/users and /api/auth",
                "description": "Convert auth endpoints to Next.js Route Handlers with Zod validation.",
                "status": "running", "priority": "critical",
                "assigned_agent_id": "agent-coder", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(72_000), "started_at": _ago(60_000),
                "progress": 55.0, "tags": ["migration", "auth"],
            },
            {
                "id": "task-008", "title": "Generate test suite for migrated endpoints",
                "description": "Write integration tests with 95%+ coverage using Vitest.",
                "status": "queued", "priority": "high",
                "assigned_agent_id": "agent-executor", "from_agent_id": "agent-coder",
                "created_at": _ago(50_000), "progress": 0.0, "tags": ["testing", "vitest"],
            },
        ],
    },
    {
        "mission": {
            "id": "mission-003",
            "name": "Campaign Launch",
            "description": "Craft and schedule Q2 product launch campaign across email, social, and blog.",
            "status": "planning",
            "objective": "Produce 12 email templates, 30 social posts, 3 long-form articles, and a launch video script.",
            "agent_ids": ["agent-orchestrator", "agent-writer", "agent-planner"],
            "created_at": _ago(1_800),
            "deadline": _future(604_800),
            "progress": 8.0,
            "tags": ["marketing", "launch", "content"],
        },
        "tasks": [
            {
                "id": "task-009", "title": "Create campaign content calendar",
                "description": "Build a structured 8-week calendar with topics, channels, and owners.",
                "status": "running", "priority": "medium",
                "assigned_agent_id": "agent-planner", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(1_700), "started_at": _ago(1_600),
                "progress": 30.0, "tags": ["planning", "calendar"],
            },
            {
                "id": "task-010", "title": "Draft launch blog post",
                "description": "Write the flagship 2000-word product launch article.",
                "status": "queued", "priority": "medium",
                "assigned_agent_id": "agent-writer", "from_agent_id": "agent-planner",
                "created_at": _ago(1_000), "progress": 0.0, "tags": ["writing", "blog"],
            },
        ],
    },
    {
        "mission": {
            "id": "mission-004",
            "name": "Data Pipeline Audit",
            "description": "Full audit of ingestion pipelines for GDPR compliance and performance.",
            "status": "completed",
            "objective": "Identify all PII touch points, flag non-compliant flows, recommend remediation steps.",
            "agent_ids": ["agent-analyst", "agent-reviewer", "agent-executor"],
            "created_at": _ago(172_800),
            "progress": 100.0,
            "tags": ["compliance", "data", "gdpr"],
        },
        "tasks": [
            {
                "id": "task-011", "title": "Map PII data flows",
                "description": "Trace all personally identifiable information through ingestion pipelines.",
                "status": "completed", "priority": "critical",
                "assigned_agent_id": "agent-analyst", "from_agent_id": "agent-orchestrator",
                "created_at": _ago(172_000), "completed_at": _ago(120_000),
                "progress": 100.0, "tags": ["gdpr", "pii", "audit"],
            },
            {
                "id": "task-012", "title": "Generate compliance report",
                "description": "Compile findings into a structured GDPR compliance report.",
                "status": "completed", "priority": "high",
                "assigned_agent_id": "agent-writer", "from_agent_id": "agent-analyst",
                "created_at": _ago(120_000), "completed_at": _ago(86_400),
                "progress": 100.0, "tags": ["report", "compliance"],
            },
        ],
    },
]

# ─── Initial Activity Events ──────────────────────────────────────────────────

INITIAL_ACTIVITY = [
    {"type": "task_completed", "agent_id": "agent-executor",      "agent_name": "Axiom",        "message": "Completed scraping 12 competitor pricing pages — 847 data points collected",  "ago": 3100},
    {"type": "handoff",        "agent_id": "agent-researcher",    "agent_name": "Nexus",         "message": "Handing off raw research data to Prism for statistical processing",             "ago": 2200},
    {"type": "task_started",   "agent_id": "agent-researcher",    "agent_name": "Nexus",         "message": "Starting deep-dive research on Competitor B product roadmap",                   "ago": 2800},
    {"type": "tool_call",      "agent_id": "agent-executor",      "agent_name": "Axiom",         "message": "Called web_search(\"Acme Corp pricing 2024 enterprise\")",                      "ago": 3800},
    {"type": "message_sent",   "agent_id": "agent-orchestrator",  "agent_name": "Pymmys Core",   "message": "Delegating market analysis to Prism — research phase 67% complete",            "ago": 3200},
    {"type": "tool_call",      "agent_id": "agent-analyst",       "agent_name": "Prism",         "message": "Running regression model on market share dataset (n=2,400)",                    "ago": 1500},
    {"type": "agent_online",   "agent_id": "agent-coder",         "agent_name": "Forge",         "message": "Forge came online — resuming endpoint migration task",                          "ago": 900},
    {"type": "task_started",   "agent_id": "agent-coder",         "agent_name": "Forge",         "message": "Migrating /api/auth/login to Next.js Route Handler",                           "ago": 400},
]


# ─── Seeder ───────────────────────────────────────────────────────────────────

def seed(db: Session) -> None:
    """Populate all tables if they are empty."""

    # Agents
    if db.query(AgentModel).count() == 0:
        for a in AGENTS:
            row = AgentModel(
                id=a["id"],
                name=a["name"],
                role=a["role"],
                status=a["status"],
                avatar=a["avatar"],
                color=a["color"],
                description=a["description"],
                capabilities=json.dumps(a["capabilities"]),
                tasks_completed=a["tasks_completed"],
                tasks_active=a["tasks_active"],
                success_rate=a["success_rate"],
                avg_latency_ms=a["avg_latency_ms"],
                token_usage=a["token_usage"],
                last_seen=_now(),
                position_x=a["position_x"],
                position_y=a["position_y"],
                department=a["department"],
            )
            db.add(row)
        db.commit()

    # Missions + Tasks
    if db.query(MissionModel).count() == 0:
        for entry in MISSIONS_AND_TASKS:
            m = entry["mission"]
            task_ids = [t["id"] for t in entry["tasks"]]
            mission_row = MissionModel(
                id=m["id"],
                name=m["name"],
                description=m["description"],
                status=m["status"],
                objective=m["objective"],
                agent_ids=json.dumps(m.get("agent_ids", [])),
                task_ids=json.dumps(task_ids),
                created_at=m["created_at"],
                deadline=m.get("deadline"),
                progress=m["progress"],
                tags=json.dumps(m.get("tags", [])),
            )
            db.add(mission_row)

            for t in entry["tasks"]:
                task_row = TaskModel(
                    id=t["id"],
                    title=t["title"],
                    description=t["description"],
                    status=t["status"],
                    priority=t["priority"],
                    assigned_agent_id=t["assigned_agent_id"],
                    from_agent_id=t.get("from_agent_id"),
                    mission_id=m["id"],
                    created_at=t["created_at"],
                    started_at=t.get("started_at"),
                    completed_at=t.get("completed_at"),
                    progress=t["progress"],
                    output=t.get("output"),
                    tags=json.dumps(t.get("tags", [])),
                )
                db.add(task_row)
        db.commit()

    # Activity
    if db.query(ActivityEventModel).count() == 0:
        for i, ev in enumerate(INITIAL_ACTIVITY):
            row = ActivityEventModel(
                id=f"evt-seed-{i:03d}",
                type=ev["type"],
                agent_id=ev["agent_id"],
                agent_name=ev["agent_name"],
                message=ev["message"],
                timestamp=_ago(ev["ago"]),
            )
            db.add(row)
        db.commit()
