from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ClipSuggestion(Base):
    __tablename__ = "clip_suggestions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    channel_login: Mapped[str] = mapped_column(String(100), index=True)
    score: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(Text)
    suggested_title: Mapped[str] = mapped_column(String(200))
