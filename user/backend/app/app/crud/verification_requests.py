from datetime import datetime, timedelta

from pydantic import EmailStr
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.encoders import jsonable_encoder

from app.crud.base import CRUDBase
from app.models.verification_requests import LoginRequests, RegistrationRequest
from app.schemas.verification_requests import LoginRequestCreate, RegistrationRequestCreate


class CRUDVerificationRequest(CRUDBase[LoginRequests | RegistrationRequest,
                                       LoginRequestCreate | RegistrationRequestCreate]):
    async def create_or_update(self,
                               db: AsyncSession,
                               obj_in: LoginRequestCreate | RegistrationRequestCreate) \
            -> LoginRequests | RegistrationRequest | None:
        db_object = self.model(**jsonable_encoder(obj_in))

        if type(obj_in) is RegistrationRequestCreate:
            # in case of registration email must be unique, delete existing request with this email
            await db.execute(delete(self.model).where(self.model.email_address == obj_in.email_address))
        elif type(obj_in) is LoginRequestCreate:
            # in case of logging in user_id should be unique, delete existing request with this user_id
            await db.execute(delete(self.model).where(self.model.user_id == obj_in.user_id))

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


crud_login_request = CRUDVerificationRequest(LoginRequests)
crud_registration_request = CRUDVerificationRequest(RegistrationRequest)
