from typing import Optional
from jose import jwe
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import create_token_for_user
from app.crud.user import crud_user
from app.crud.email import crud_email
from app.crud.verification_requests import crud_login_request, crud_registration_request
from app.schemas.email_forms import EmailForm, EmailContactCreate
from app.schemas.verification_requests import RegistrationRequestCreate, LoginRequestCreate
from app.database.dependencies import get_db
from app.core.config import settings

from app.api.email_utils import verify_email

signing_router = APIRouter()


@signing_router.post("/registration", status_code=status.HTTP_201_CREATED)
async def registration(registration_data: EmailForm,
                       background_tasks: BackgroundTasks,
                       user_token: Optional[str] = None,
                       db: AsyncSession = Depends(get_db)) -> None:
    """
    Create registration request and send verification email
    """
    # Get user_id from token or generate it first, if no token
    # TEST
    user_id = 1
    # user_id = await get_user_id_by_token(user_token=user_token)

    # Check if this email already registered
    registered_id = await crud_email.get_user_id_by_email(db=db, requested_email=registration_data.email_address)
    if registered_id is not None:
        # User already logged in with this email
        if registered_id == user_id:
            raise HTTPException(status_code=status.HTTP_200_OK,
                                detail="You are already logged in with this email")

        # This email already registered for another id, user need to log in
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="This email already registered for another id")

    registration_request_to_create = RegistrationRequestCreate(user_id=user_id,
                                                               email_address=registration_data.email_address)
    registration_request = await crud_registration_request.create_or_update(db=db,
                                                                            obj_in=registration_request_to_create)

    background_tasks.add_task(verify_email,
                              request_id=registration_request.id,
                              email_to_verify=registration_data.email_address)


@signing_router.get("/registration/verify/{request_id_hashed}", status_code=status.HTTP_201_CREATED)
async def register_email(request_id_hashed: str, db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """
    Register new user by hashed request id and add his email contact with token
    """
    request_id = int(jwe.decrypt(request_id_hashed, settings.JWE_SECRET).decode("utf-8"))
    register_request = await crud_registration_request.get_object_by_id(db=db, requested_id=request_id)
    if register_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Request expired")

    # create new record in table with email contacts
    await crud_email.create(db=db, obj_in=EmailContactCreate(email_address=register_request.email_address,
                                                             user_id=register_request.user_id))

    # now user can log in and can be logged out, for second purpose add session token
    user_to_update = await crud_user.get_object_by_id(db=db, requested_id=register_request.user_id)
    updated_user = await crud_user.update_session_token(db=db, update_obj=user_to_update)

    # generate new token for this user and return to set it in cookies on frontend
    return JSONResponse(status_code=status.HTTP_201_CREATED,
                        content={"token": await create_token_for_user(updated_user)})


@signing_router.post("/login", status_code=status.HTTP_201_CREATED)
async def log_in(registration_data: EmailForm,
                 background_tasks: BackgroundTasks,
                 db: AsyncSession = Depends(get_db)) -> None:
    """
    Create new anonymous user.
    """

    # check if this email already registered and get user id registered with this email address
    registered_id = (await crud_email.get_user_id_by_email(db=db,
                                                           requested_email=registration_data.email_address)).user_id
    if registered_id is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="This email is not registered")

    login_request_to_create = LoginRequestCreate(user_id=registered_id)
    login_request = await crud_login_request.create_or_update(db=db, obj_in=login_request_to_create)

    background_tasks.add_task(verify_email,
                              request_id=login_request.id,
                              email_to_verify=registration_data.email_address)


@signing_router.get("/login/verify/{request_id_hashed}", status_code=status.HTTP_200_OK)
async def log_in_from_email(request_id_hashed: str, db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """
    Log in user by hashed request id and return his token to set in cookies
    """
    request_id = int(jwe.decrypt(request_id_hashed, settings.JWE_SECRET).decode("utf-8"))
    login_request = await crud_login_request.get_object_by_id(db=db, requested_id=request_id)
    if login_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Request expired")

    # get user logging in
    user = await crud_user.get_object_by_id(db=db, requested_id=login_request.user_id)

    # generate token for this user and return to set it in cookies on frontend
    return JSONResponse(status_code=status.HTTP_200_OK,
                        content={"token": await create_token_for_user(user)})
