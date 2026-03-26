from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


def test_billing_webhook_requires_signature():
    client = TestClient(app)
    previous_secret = settings.stripe_webhook_secret
    settings.stripe_webhook_secret = "whsec_test"
    try:
        response = client.post("/api/billing/webhook", content=b"{}")
    finally:
        settings.stripe_webhook_secret = previous_secret

    assert response.status_code == 400
    assert response.json()["detail"] == "Missing Stripe-Signature header"
