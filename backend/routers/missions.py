"""GET /missions  ·  POST /missions"""

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import MissionModel, TaskModel, ActivityEventModel
from ..schemas import MissionOut, MissionCreate, TaskOut

router = APIRouter(prefix="/missions", tags=["missions"])


def _task_to_schema(t: TaskModel) -> TaskOut:
    return TaskOut(
        id=t.id,
        title=t.title,
        description=t.description,
        status=t.status,
        priority=t.priority,
        assignedAgentId=t.assigned_agent_id,
        fromAgentId=t.from_agent_id,
        missionId=t.mission_id,
        createdAt=t.created_at,
        startedAt=t.started_at,
        completedAt=t.completed_at,
        progress=t.progress,
        output=t.output,
        tags=t.tags_list(),
    )


def _mission_to_schema(m: MissionModel, tasks: list[TaskModel]) -> MissionOut:
    return MissionOut(
        id=m.id,
        name=m.name,
        description=m.description,
        status=m.status,
        objective=m.objective,
        agentIds=m.agent_ids_list(),
        taskIds=m.task_ids_list(),
        createdAt=m.created_at,
        deadline=m.deadline,
        progress=m.progress,
        tags=m.tags_list(),
        tasks=[_task_to_schema(t) for t in tasks],
    )


@router.get("", response_model=list[MissionOut])
def list_missions(db: Session = Depends(get_db)) -> list[MissionOut]:
    missions = db.query(MissionModel).order_by(MissionModel.created_at.desc()).all()
    result = []
    for m in missions:
        tasks = db.query(TaskModel).filter(TaskModel.mission_id == m.id).all()
        result.append(_mission_to_schema(m, tasks))
    return result


@router.post("", response_model=MissionOut, status_code=201)
def create_mission(payload: MissionCreate, db: Session = Depends(get_db)) -> MissionOut:
    now = datetime.now(timezone.utc).isoformat()
    mission_id = f"mission-{uuid.uuid4().hex[:8]}"

    m = MissionModel(
        id=mission_id,
        name=payload.name,
        description=payload.description,
        status=payload.status,
        objective=payload.objective,
        agent_ids=json.dumps(payload.agent_ids),
        task_ids=json.dumps([]),
        created_at=now,
        deadline=payload.deadline,
        progress=0.0,
        tags=json.dumps(payload.tags),
    )
    db.add(m)

    # Emit activity event
    evt = ActivityEventModel(
        id=f"evt-mission-{uuid.uuid4().hex[:12]}",
        type="task_started",
        agent_id="agent-orchestrator",
        agent_name="Pymmys Core",
        message=f"New mission created: {payload.name}",
        timestamp=now,
    )
    db.add(evt)
    db.commit()
    db.refresh(m)

    return _mission_to_schema(m, [])
