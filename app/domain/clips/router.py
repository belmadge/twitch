from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_channel_owner
from app.core.database import get_db
from app.domain.clips.schemas import ClipEventIn, ClipSuggestionOut
from app.domain.clips.service import ClipService

router = APIRouter(prefix="/clips", tags=["clips"])
service = ClipService()


@router.post("/detect", response_model=ClipSuggestionOut | None)
def detect_clip(payload: ClipEventIn, db: Session = Depends(get_db)):
    return service.detect_and_store(db, payload)


@router.get("/{channel_login}", response_model=list[ClipSuggestionOut])
def list_clips(
    channel_login: str,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_channel_owner),
):
    return service.list_clips(db, channel_login)
