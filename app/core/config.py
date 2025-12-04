"""
Application configuration loaded from environment variables.

Uses pydantic-settings for type-safe configuration management.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        DATABASE_URL: PostgreSQL connection string
        SECRET_KEY: Secret key for JWT signing (must be strong in production)
        ACCESS_TOKEN_EXPIRE_MINUTES: JWT access token expiration time
        ALGORITHM: JWT signing algorithm
    """
    
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/pyauth"
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    ALGORITHM: str = "HS256"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Uses lru_cache to avoid reading .env file on every request.
    """
    return Settings()


# Global settings instance for convenience
settings = get_settings()
