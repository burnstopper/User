from sqlalchemy import select
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.email import Email
from app.schemas.email_forms import EmailContactCreate


class CRUDEmail(CRUDBase[Email, EmailContactCreate]):

    async def get_user_id_by_email(self, db: AsyncSession, requested_email: EmailStr) -> int | None:
        user_id = (await db.execute(select(self.model).where(self.model.email_address == requested_email))).first()
        if user_id:
            # result is a tuple with only one item
            return user_id[0]
        return None


crud_email = CRUDEmail(Email)
