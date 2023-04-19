from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.schemas.researcher import ResearcherCreate
from app.models.researcher import Researcher


class CRUDResearcher(CRUDBase[Researcher, ResearcherCreate]):
    async def check_by_user_id(self, db: AsyncSession, requested_id: int) -> bool:
        return bool(
            (await db.execute(select(self.model).where(self.model.user_id == requested_id))).first()
        )


crud_researcher = CRUDResearcher(Researcher)
