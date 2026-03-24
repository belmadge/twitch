from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ViewerProfile(Base):
    __tablename__ = "viewer_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    channel_login: Mapped[str] = mapped_column(String(100), index=True)
    username: Mapped[str] = mapped_column(String(100), index=True)
    points: Mapped[int] = mapped_column(Integer, default=0)
    segment: Mapped[str] = mapped_column(String(20), default="new")


class Campaign(Base):
    __tablename__ = "crm_campaigns"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    channel_login: Mapped[str] = mapped_column(String(100), index=True)
    name: Mapped[str] = mapped_column(String(100))
    segment: Mapped[str] = mapped_column(String(20))
    reward_points: Mapped[int] = mapped_column(Integer)
    message: Mapped[str] = mapped_column(Text)
