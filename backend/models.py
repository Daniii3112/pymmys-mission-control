"""SQLAlchemy ORM models. All array/object fields stored as JSON strings in SQLite."""

import json
from datetime import datetime
from typing import Any

from sqlalchemy import Column, Float, Integer, String, Text
from sqlalchemy.orm import mapped_column

from .database import Base


def _json_default(v: Any) -> str:
    return json.dumps(v) if v is not None else "[]"


def _json_load(v: str | None, default: Any = None) -> Any:
    if v is None:
        return default if default is not None else []
    try:
        return json.loads(v)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else []


class AgentModel(Base):
    __tablename__ = "agents"

    id              = Column(String,  primary_key=True, index=True)
    name            = Column(String,  nullable=False)
    role            = Column(String,  nullable=False)
    status          = Column(String,  nullable=False, default="online")
    avatar          = Column(String,  nullable=False, default="🤖")
    color           = Column(String,  nullable=False, default="#818cf8")
    description     = Column(Text,    nullable=False, default="")
    capabilities    = Column(Text,    nullable=False, default="[]")   # JSON array
    tasks_completed = Column(Integer, nullable=False, default=0)
    tasks_active    = Column(Integer, nullable=False, default=0)
    success_rate    = Column(Float,   nullable=False, default=100.0)
    avg_latency_ms  = Column(Integer, nullable=False, default=500)
    token_usage     = Column(Integer, nullable=False, default=0)
    last_seen       = Column(String,  nullable=False)   # ISO datetime string
    position_x      = Column(Float,   nullable=False, default=50.0)
    position_y      = Column(Float,   nullable=False, default=50.0)
    department      = Column(String,  nullable=False, default="General")

    def capabilities_list(self) -> list[str]:
        return _json_load(self.capabilities, [])


class MissionModel(Base):
    __tablename__ = "missions"

    id          = Column(String, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    description = Column(Text,   nullable=False, default="")
    status      = Column(String, nullable=False, default="planning")
    objective   = Column(Text,   nullable=False, default="")
    agent_ids   = Column(Text,   nullable=False, default="[]")  # JSON
    task_ids    = Column(Text,   nullable=False, default="[]")  # JSON
    created_at  = Column(String, nullable=False)
    deadline    = Column(String, nullable=True)
    progress    = Column(Float,  nullable=False, default=0.0)
    tags        = Column(Text,   nullable=False, default="[]")  # JSON

    def agent_ids_list(self) -> list[str]:
        return _json_load(self.agent_ids, [])

    def task_ids_list(self) -> list[str]:
        return _json_load(self.task_ids, [])

    def tags_list(self) -> list[str]:
        return _json_load(self.tags, [])


class TaskModel(Base):
    __tablename__ = "tasks"

    id                = Column(String, primary_key=True, index=True)
    title             = Column(String, nullable=False)
    description       = Column(Text,   nullable=False, default="")
    status            = Column(String, nullable=False, default="queued")
    priority          = Column(String, nullable=False, default="medium")
    assigned_agent_id = Column(String, nullable=False)
    from_agent_id     = Column(String, nullable=True)
    mission_id        = Column(String, nullable=False, index=True)
    created_at        = Column(String, nullable=False)
    started_at        = Column(String, nullable=True)
    completed_at      = Column(String, nullable=True)
    progress          = Column(Float,  nullable=False, default=0.0)
    output            = Column(Text,   nullable=True)
    tags              = Column(Text,   nullable=False, default="[]")  # JSON

    def tags_list(self) -> list[str]:
        return _json_load(self.tags, [])


class ActivityEventModel(Base):
    __tablename__ = "activity_events"

    id              = Column(String, primary_key=True, index=True)
    type            = Column(String, nullable=False)
    agent_id        = Column(String, nullable=False)
    agent_name      = Column(String, nullable=False)
    message         = Column(Text,   nullable=False)
    timestamp       = Column(String, nullable=False)  # ISO datetime string
    event_metadata  = Column(Text,   nullable=True)   # JSON (renamed: 'metadata' is reserved)

    def metadata_dict(self) -> dict:
        return _json_load(self.event_metadata, {})
