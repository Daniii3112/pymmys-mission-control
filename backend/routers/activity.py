"""GET /activity"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ActivityEventModel
from ..schemas import ActivityEventOut

router = APIRouter(prefix="/activity", tags=["activity"])


def _event_to_schema(e: ActivityEventModel) -> ActivityEventOut:
    return ActivityEventOut(
        id=e.id,
        type=e.type,
        agentId=e.agent_id,
        agentName=e.agent_name,
        message=e.message,
        timestamp=e.timestamp,
        metadata=e.metadata_dict() or None,
    )


@router.get("", response_model=list[ActivityEventOut])
def list_activity(
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
) -> list[ActivityEventOut]:
    events = (
        db.query(ActivityEventModel)
        .order_by(ActivityEventModel.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [_event_to_schema(e) for e in events]
