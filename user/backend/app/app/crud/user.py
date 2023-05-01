import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase, CreateType
from app.models.user import User


class CRUDUser(CRUDBase[User, CreateType]):
    async def create(self, db: AsyncSession, obj_in: Optional[CreateType] = None) -> User:
        db_object = self.model()

        db.add(db_object)
        await db.flush()

        return db_object

    async def update_session_token(self, db: AsyncSession, update_obj: User) -> User:
        update_obj.session_token = str(uuid.uuid4())
        await db.flush()
        return update_obj


crud_user = CRUDUser(User)
