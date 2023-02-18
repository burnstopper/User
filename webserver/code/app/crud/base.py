from typing import Generic, Type, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)


class CRUDBase(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    # pass because usually every model has its own create function
    async def create(self, db: AsyncSession) -> ModelType:
        pass
