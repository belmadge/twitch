from fastapi.testclient import TestClient

from app.main import app


def test_root_has_four_objectives():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    payload = response.json()
    assert set(payload["objectives"].keys()) == {"bot", "clips", "crm", "safety"}
