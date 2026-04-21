"""GET /system/summary"""

import time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AgentModel, MissionModel, TaskModel
from ..schemas import SystemSummary

router = APIRouter(prefix="/system", tags=["system"])

_start_time = time.time()


@router.get("/summary", response_model=SystemSummary)
def get_summary(db: Session = Depends(get_db)) -> SystemSummary:
    agents = db.query(AgentModel).all()
    missions = db.query(MissionModel).all()
    tasks = db.query(TaskModel).all()

    active_statuses = {"online", "busy", "idle"}

    return SystemSummary(
        totalAgents=len(agents),
        activeAgents=sum(1 for a in agents if a.status in active_statuses),
        busyAgents=sum(1 for a in agents if a.status == "busy"),
        totalMissions=len(missions),
        activeMissions=sum(1 for m in missions if m.status in {"active", "planning"}),
        completedTasks=sum(1 for t in tasks if t.status == "completed"),
        runningTasks=sum(1 for t in tasks if t.status == "running"),
        totalTokenUsage=sum(a.token_usage for a in agents),
        uptimeSeconds=round(time.time() - _start_time, 1),
    )
