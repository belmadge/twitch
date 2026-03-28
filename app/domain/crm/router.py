from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from fastapi import HTTPException, status

from app.api.deps import current_user, require_channel_owner
from app.core.database import get_db
from app.domain.crm.schemas import CampaignCreate, CampaignOut, ViewerEventIn, ViewerOut
from app.domain.crm.service import CrmService

router = APIRouter(prefix="/crm", tags=["crm"])
service = CrmService()


@router.post("/viewer-event", response_model=ViewerOut)
def viewer_event(payload: ViewerEventIn, db: Session = Depends(get_db), user: dict = Depends(current_user)):
    if user.get("sub") != payload.channel_login.lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden for this channel")
    return service.register_viewer_event(db, payload)


@router.get("/{channel_login}/viewers", response_model=list[ViewerOut])
def list_viewers(
    channel_login: str,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_channel_owner),
):
    return service.list_viewers(db, channel_login)


@router.post("/{channel_login}/campaigns", response_model=CampaignOut)
def create_campaign(
    channel_login: str,
    payload: CampaignCreate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_channel_owner),
):
    return service.create_campaign(db, channel_login, payload)


@router.post("/{channel_login}/campaigns/{campaign_id}/apply")
def apply_campaign(
    channel_login: str,
    campaign_id: int,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_channel_owner),
):
    return service.apply_campaign(db, channel_login, campaign_id)
