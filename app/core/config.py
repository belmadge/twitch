from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Twitch Creator SaaS"
    app_env: str = "development"
    app_base_url: str = "http://localhost:8000"
    port: int = 8000

    jwt_secret: str = "change_this_secret"
    jwt_exp_minutes: int = 60 * 24 * 7

    twitch_client_id: str = ""
    twitch_client_secret: str = ""
    twitch_redirect_uri: str = ""
    twitch_bot_username: str = ""
    twitch_bot_oauth_token: str = ""

    database_url: str = "sqlite:///./twitch_saas.db"
    redis_url: str | None = None

    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    stripe_price_pro: str | None = None


settings = Settings()
