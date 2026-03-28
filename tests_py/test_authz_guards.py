from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app


def _auth_headers(channel_login: str) -> dict[str, str]:
    token = create_access_token(subject=channel_login)
    return {"Authorization": f"Bearer {token}"}


def test_clips_detect_requires_owner_token():
    client = TestClient(app)
    payload = {"channel_login": "CanalX", "events_last_minute": 5, "baseline_events": 10}

    response = client.post("/api/clips/detect", json=payload)
    assert response.status_code == 401

    response = client.post("/api/clips/detect", json=payload, headers=_auth_headers("other_channel"))
    assert response.status_code == 403

    response = client.post("/api/clips/detect", json=payload, headers=_auth_headers("canalx"))
    assert response.status_code == 200


def test_crm_viewer_event_requires_owner_token():
    client = TestClient(app)
    payload = {"channel_login": "CanalY", "username": "viewer_1"}

    response = client.post("/api/crm/viewer-event", json=payload)
    assert response.status_code == 401

    response = client.post("/api/crm/viewer-event", json=payload, headers=_auth_headers("other_channel"))
    assert response.status_code == 403
