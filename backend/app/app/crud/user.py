from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.user import User


class CRUDUser(CRUDBase[User]):
    async def create(self, db: AsyncSession) -> User:
        db_object = self.model()

        db.add(db_object)
        await db.commit()

        return db_object


user = CRUDUser(User)
