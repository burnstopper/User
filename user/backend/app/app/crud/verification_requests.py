from datetime import datetime, timedelta

from pydantic import EmailStr
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.verification_requests import LoginRequest, RegistrationRequest
from app.schemas.verification_requests import LoginRequestCreate, RegistrationRequestCreate


class CRUDVerificationRequest(CRUDBase[LoginRequest | RegistrationRequest,
                                       LoginRequestCreate | RegistrationRequestCreate]):
    async def create_or_update(self,
                               db: AsyncSession,
                               obj_in: LoginRequestCreate | RegistrationRequestCreate) \
            -> LoginRequest | RegistrationRequest | None:
        db_object = self.model(**jsonable_encoder(obj_in))

        # if request from this user already exists, do not change database
        # can not delete or update the old one because of critical perfomance issues caused by database lock
        existing = (await db.execute(select(self.model).where(self.model.user_id == obj_in.user_id))).first()
        if existing:
            return db_object

        db.add(db_object)
        await db.flush()

        return db_object

    async def delete_expired_requests(self, db: AsyncSession, expiration_time: timedelta) -> None:
        await db.execute(delete(self.model).where(self.model.creation_datetime < datetime.now() - expiration_time))
        await db.flush()

    async def delete_request_by_id(self, db: AsyncSession, requested_id: int) -> None:
        request_to_delete = await db.get(self.model, requested_id)

        await db.delete(request_to_delete)
        await db.flush()


crud_login_request = CRUDVerificationRequest(LoginRequest)
crud_registration_request = CRUDVerificationRequest(RegistrationRequest)
