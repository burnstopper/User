from pydantic import BaseModel, EmailStr
from datetime import datetime

# https://fastapi.tiangolo.com/tutorial/sql-databases/#create-the-pydantic-models
# not a @dataclass because dict() method is required in CRUD


class LoginRequestCreate(BaseModel):
    user_id: int


class RegistrationRequestCreate(LoginRequestCreate):
    email_address: EmailStr
