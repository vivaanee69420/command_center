"""Centralised settings — pulls from .env via Pydantic."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # core
    JWT_SECRET: str = "dev-change-me"
    TOKEN_TTL_HOURS: int = 12
    CORS_ORIGINS: str = "http://localhost:9100,http://localhost:3000"

    # db
    DATABASE_URL: str = "postgresql+asyncpg://commandos:commandos_dev@localhost:5432/commandos"
    REDIS_URL: str = "redis://localhost:6379/0"
    TOKEN_ENC_KEY: str = ""

    # ai
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    AI_BRAIN_MODEL: str = "claude-sonnet-4-5"
    AI_BRAIN_INTERVAL_MIN: int = 60

    # google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8765/api/integrations/google/callback"
    GOOGLE_ADS_DEVELOPER_TOKEN: str = ""
    GOOGLE_ADS_LOGIN_CUSTOMER_ID: str = ""
    GOOGLE_ADS_REFRESH_TOKEN: str = ""

    # meta
    META_APP_ID: str = ""
    META_APP_SECRET: str = ""
    META_REDIRECT_URI: str = "http://localhost:8765/api/integrations/meta/callback"
    META_SYSTEM_USER_TOKEN: str = ""
    META_TOKEN_ELEVATE: str = ""
    META_TOKEN_P4G: str = ""
    META_TOKEN_FTS: str = ""
    META_TOKEN_WL: str = ""

    GHL_TOKENS: str = ""
    DENTALLY_API_KEY: str = ""

    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""

    AHREFS_API_KEY: str = ""
    SEMRUSH_API_KEY: str = ""

    ELEVENLABS_API_KEY: str = ""
    BLAND_API_KEY: str = ""

    SENDGRID_API_KEY: str = ""
    SENDER_EMAIL: str = ""
    RESEND_API_KEY: str = ""

    @property
    def cors_list(self) -> list[str]:
        return [s.strip() for s in self.CORS_ORIGINS.split(",") if s.strip()]


@lru_cache
def settings() -> Settings:
    return Settings()
