from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.crm.models import Campaign, ViewerProfile
from app.domain.crm.schemas import CampaignCreate, ViewerEventIn


def _segment(points: int) -> str:
    if points >= 1000:
        return "vip"
    if points >= 400:
        return "core"
    if points >= 80:
        return "casual"
    return "new"


class CrmService:
    """Responsável por fidelidade, segmentação e campanhas."""

    def register_viewer_event(self, db: Session, event: ViewerEventIn) -> ViewerProfile:
        query = select(ViewerProfile).where(
            ViewerProfile.channel_login == event.channel_login.lower(),
            ViewerProfile.username == event.username.lower(),
        )
        viewer = db.scalar(query)
        if not viewer:
            viewer = ViewerProfile(channel_login=event.channel_login.lower(), username=event.username.lower(), points=5)
            db.add(viewer)
        else:
            viewer.points += 2

        viewer.segment = _segment(viewer.points)
        db.commit()
        db.refresh(viewer)
        return viewer

    def list_viewers(self, db: Session, channel_login: str) -> list[ViewerProfile]:
        query = (
            select(ViewerProfile)
            .where(ViewerProfile.channel_login == channel_login.lower())
            .order_by(ViewerProfile.points.desc())
        )
        return list(db.scalars(query))

    def create_campaign(self, db: Session, channel_login: str, payload: CampaignCreate) -> Campaign:
        campaign = Campaign(
            channel_login=channel_login.lower(),
            name=payload.name,
            segment=payload.segment,
            reward_points=payload.reward_points,
            message=payload.message,
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)
        return campaign

    def apply_campaign(self, db: Session, channel_login: str, campaign_id: int) -> dict[str, int]:
        campaign = db.get(Campaign, campaign_id)
        if not campaign or campaign.channel_login != channel_login.lower():
            return {"affected_viewers": 0, "awarded_points": 0}

        query = select(ViewerProfile).where(
            ViewerProfile.channel_login == channel_login.lower(),
            ViewerProfile.segment == campaign.segment,
        )
        viewers = list(db.scalars(query))

        for viewer in viewers:
            viewer.points += campaign.reward_points
            viewer.segment = _segment(viewer.points)

        db.commit()
        return {
            "affected_viewers": len(viewers),
            "awarded_points": len(viewers) * campaign.reward_points,
        }
