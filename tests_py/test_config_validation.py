import pytest

from app.core.config import Settings


def test_production_requires_non_default_jwt_secret():
    with pytest.raises(ValueError, match="JWT_SECRET must be changed in production."):
        Settings(app_env="production", jwt_secret="change_this_secret")


def test_production_accepts_custom_jwt_secret():
    settings = Settings(app_env="production", jwt_secret="super-secret-value")
    assert settings.jwt_secret == "super-secret-value"
