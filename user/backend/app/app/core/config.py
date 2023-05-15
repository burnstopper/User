import pathlib
from typing import Optional
from pydantic import BaseSettings, EmailStr


class Settings(BaseSettings):
    HOST: str
    PORT: int
    WORKERS_PER_CORE: int = 1
    WEB_CONCURRENCY: Optional[str] = None
    LOG_LEVEL: str = "error"

    # url naming: https://docs.sqlalchemy.org/en/20/core/engines.html#sqlite
    SQLALCHEMY_DATABASE_URI: str

    JWT_SECRET: str
    JWT_ALGORITHM: str
    TOKEN_EXPIRATION_TIME_IN_DAYS: int

    JWE_SECRET: str
    JWE_ENCRYPTION_ALGORITHM: str

    REQUESTS_EXPIRATION_TIME_IN_MINUTES: int

    BEARER_TOKEN: str

    MAIL_USERNAME: EmailStr
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int
    MAIL_SERVER: str

    class Config:
        # case_sensitive: https://docs.pydantic.dev/usage/settings/#environment-variable-names
        case_sensitive = True

        # read settings from .env file
        env_file = ".env"
        env_file_encoding = 'utf-8'


settings = Settings(_env_file=f'{pathlib.Path(__file__).parents[3].resolve()}/.env')
