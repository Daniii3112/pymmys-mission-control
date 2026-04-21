"""GET /agents  ·  POST /agents/{id}/run"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AgentModel, ActivityEventModel
from ..schemas import AgentOut, AgentPosition, RunAgentResponse

router = APIRouter(prefix="/agents", tags=["agents"])


def _agent_to_schema(a: AgentModel) -> AgentOut:
    return AgentOut(
        id=a.id,
        name=a.name,
        role=a.role,
        status=a.status,
        avatar=a.avatar,
        color=a.color,
        description=a.description,
        capabilities=a.capabilities_list(),
        tasksCompleted=a.tasks_completed,
        tasksActive=a.tasks_active,
        successRate=a.success_rate,
        avgLatencyMs=a.avg_latency_ms,
        tokenUsage=a.token_usage,
        lastSeen=a.last_seen,
        position=AgentPosition(x=a.position_x, y=a.position_y),
        department=a.department,
    )


@router.get("", response_model=list[AgentOut])
def list_agents(db: Session = Depends(get_db)) -> list[AgentOut]:
    agents = db.query(AgentModel).all()
    return [_agent_to_schema(a) for a in agents]


@router.post("/{agent_id}/run", response_model=RunAgentResponse)
def run_agent(agent_id: str, db: Session = Depends(get_db)) -> RunAgentResponse:
    agent = db.query(AgentModel).filter(AgentModel.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id!r} not found")

    if agent.status == "busy":
        return RunAgentResponse(
            ok=False,
            message=f"{agent.name} is already busy",
            agent_id=agent_id,
        )

    # Mark agent as busy
    agent.status = "busy"
    agent.tasks_active = (agent.tasks_active or 0) + 1
    now = datetime.now(timezone.utc).isoformat()
    agent.last_seen = now

    # Emit an activity event
    evt = ActivityEventModel(
        id=f"evt-run-{uuid.uuid4().hex[:12]}",
        type="agent_online",
        agent_id=agent.id,
        agent_name=agent.name,
        message=f"{agent.name} activated — ready to receive tasks",
        timestamp=now,
    )
    db.add(evt)
    db.commit()

    return RunAgentResponse(
        ok=True,
        message=f"{agent.name} is now active",
        agent_id=agent_id,
    )
