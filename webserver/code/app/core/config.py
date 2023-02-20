import pathlib
from pydantic import BaseSettings


class Settings(BaseSettings):
    # CHANGE DB NAME (example.db is used only as template)
    # url naming: https://docs.sqlalchemy.org/en/20/core/engines.html#sqlite
    SQLALCHEMY_DATABASE_URI: str

    JWT_SECRET: str
    JWT_ALGORITHM: str
    TOKEN_EXPIRE_TIME_IN_DAYS: int

    JWE_SECRET: str
    JWE_ENCRYPTION_ALGORITHM: str

    class Config:
        # case_sensitive: https://docs.pydantic.dev/usage/settings/#environment-variable-names
        case_sensitive = True
        # read settings from .env file
        env_file = ".env"
        env_file_encoding = 'utf-8'


settings = Settings(_env_file=f'{pathlib.Path(__file__).parents[2].resolve()}/.env')
