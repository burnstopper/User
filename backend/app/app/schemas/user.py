from typing import Optional
from pydantic import BaseModel, UUID4

# https://fastapi.tiangolo.com/tutorial/sql-databases/#create-the-pydantic-models
# not a @dataclass because dict() method is required in CRUD


class UserBase(BaseModel):
    session_token: UUID4 | None


class User(UserBase):
    id: int

    # https://fastapi.tiangolo.com/tutorial/sql-databases/#use-pydantics-orm_mode
    class Config:
        orm_mode = True
