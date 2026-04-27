"""Pydantic schemas — shape of data going in/out of the API.

These mirror the TypeScript types in types/index.ts exactly so the
frontend can consume them without any field mapping.
"""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, field_serializer
from datetime import datetime


# ─── Agent ───────────────────────────────────────────────────────────────────

class AgentPosition(BaseModel):
    x: float
    y: float


class AgentOut(BaseModel):
    id: str
    name: str
    role: str
    status: str
    avatar: str
    color: str
    description: str
    capabilities: list[str]
    tasksCompleted: int
    tasksActive: int
    successRate: float
    avgLatencyMs: int
    tokenUsage: int
    lastSeen: str          # ISO datetime string — frontend parses to Date
    position: AgentPosition
    department: str

    model_config = {"from_attributes": True}


# ─── Task ─────────────────────────────────────────────────────────────────────

class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    status: str
    priority: str
    assignedAgentId: str
    fromAgentId: Optional[str] = None
    missionId: str
    createdAt: str
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    progress: float
    output: Optional[str] = None
    tags: list[str]

    model_config = {"from_attributes": True}


# ─── Mission ──────────────────────────────────────────────────────────────────

class MissionOut(BaseModel):
    id: str
    name: str
    description: str
    status: str
    objective: str
    agentIds: list[str]
    taskIds: list[str]
    createdAt: str
    deadline: Optional[str] = None
    progress: float
    tags: list[str]
    tasks: list[TaskOut] = []   # embedded tasks for convenience

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"
    assigned_agent_id: str
    tags: list[str] = []


class MissionCreate(BaseModel):
    name: str
    description: str = ""
    objective: str = ""
    status: str = "planning"
    agent_ids: list[str] = []
    tags: list[str] = []
    deadline: Optional[str] = None
    tasks: list[TaskCreate] = []


# ─── Activity ─────────────────────────────────────────────────────────────────

class ActivityEventOut(BaseModel):
    id: str
    type: str
    agentId: str
    agentName: str
    message: str
    timestamp: str    # ISO datetime string
    metadata: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


# ─── System Summary ───────────────────────────────────────────────────────────

class SystemSummary(BaseModel):
    totalAgents: int
    activeAgents: int
    busyAgents: int
    totalMissions: int
    activeMissions: int
    completedTasks: int
    runningTasks: int
    totalTokenUsage: int
    uptimeSeconds: float


# ─── Run Agent ────────────────────────────────────────────────────────────────

class RunAgentResponse(BaseModel):
    ok: bool
    message: str
    agent_id: str
