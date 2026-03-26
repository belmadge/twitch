import stripe
from fastapi import APIRouter, Header, HTTPException, Request

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


@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str | None = Header(default=None)):
    payload = await request.body()
    try:
        event = service.parse_webhook_event(payload=payload, signature=stripe_signature)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature") from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Webhook error: {exc}") from exc

    event_type = event.get("type")
    # TODO: persist subscription status by customer/channel for production analytics and access control.
    return {"received": True, "event_type": event_type}
