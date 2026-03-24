from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.clips.models import ClipSuggestion
from app.domain.clips.schemas import ClipEventIn


class ClipService:
    """Responsável por detectar picos e sugerir clips curtos."""

    def detect_and_store(self, db: Session, payload: ClipEventIn) -> ClipSuggestion | None:
        multiplier = payload.events_last_minute / max(payload.baseline_events, 1)
        if payload.events_last_minute < 12 or multiplier < 2.2:
            return None

        score = int(multiplier * 10 + payload.events_last_minute / 2)
        clip = ClipSuggestion(
            channel_login=payload.channel_login.lower(),
            score=score,
            reason=f"Pico detectado: {payload.events_last_minute} eventos ({multiplier:.1f}x baseline)",
            suggested_title=f"[{payload.channel_login}] Highlight automático ({score} pts)",
        )
        db.add(clip)
        db.commit()
        db.refresh(clip)
        return clip

    def list_clips(self, db: Session, channel_login: str) -> list[ClipSuggestion]:
        query = select(ClipSuggestion).where(ClipSuggestion.channel_login == channel_login.lower())
        return list(db.scalars(query))
