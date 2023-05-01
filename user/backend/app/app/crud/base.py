from typing import Generic, Type, TypeVar, Optional
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.encoders import jsonable_encoder

from app.database.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateType = TypeVar("CreateType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def create(self, db: AsyncSession, obj_in: Optional[CreateType] = None) -> ModelType:
        db_object = self.model(**jsonable_encoder(obj_in))

        db.add(db_object)
        await db.flush()

        return db_object

    async def get_object_by_id(self, db: AsyncSession, requested_id: int) -> Optional[ModelType]:
        result = (await db.execute(select(self.model).where(self.model.id == requested_id))).first()
        if result:
            # result is a tuple with only one item
            return result[0]
        return None

