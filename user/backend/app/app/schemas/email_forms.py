from pydantic import BaseModel, EmailStr

# https://fastapi.tiangolo.com/tutorial/sql-databases/#create-the-pydantic-models
# not a @dataclass because dict() method is required in CRUD


class EmailForm(BaseModel):
    email_address: EmailStr


class EmailContactCreate(EmailForm):
    user_id: int

    # https://fastapi.tiangolo.com/tutorial/sql-databases/#use-pydantics-orm_mode
    class Config:
        orm_mode = True
