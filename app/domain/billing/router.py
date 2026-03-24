from fastapi import APIRouter, HTTPException

from app.api.deps import require_channel_owner
from app.domain.billing.service import BillingService
from fastapi import Depends

router = APIRouter(prefix="/billing", tags=["billing"])
service = BillingService()


@router.get("/status")
def billing_status():
    return {"enabled": service.enabled()}


@router.post("/{channel_login}/checkout")
def create_checkout(channel_login: str, _user: dict = Depends(require_channel_owner)):
    try:
        return {"checkout_url": service.create_checkout(channel_login.lower())}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
