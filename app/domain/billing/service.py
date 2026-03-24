import stripe

from app.core.config import settings


class BillingService:
    def __init__(self) -> None:
        stripe.api_key = settings.stripe_secret_key

    def enabled(self) -> bool:
        return bool(settings.stripe_secret_key and settings.stripe_price_pro)

    def create_checkout(self, channel_login: str) -> str:
        if not self.enabled():
            raise ValueError("Stripe not configured")

        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": settings.stripe_price_pro, "quantity": 1}],
            success_url=f"{settings.app_base_url}/billing/success?channel={channel_login}",
            cancel_url=f"{settings.app_base_url}/billing/cancel?channel={channel_login}",
            metadata={"channel_login": channel_login},
        )
        return session.url
