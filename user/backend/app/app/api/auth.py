import jwt
from datetime import datetime, timedelta
from pydantic import UUID4
from dataclasses import dataclass
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwe
from jose.exceptions import JOSEError
from jwt import PyJWTError
from app.crud.user import crud_user
from app.schemas.user import User
from app.database.session import AsyncSessionLocal
from app.core.config import settings

security = HTTPBearer()

expired_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Expired token",
)


async def has_access(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Function that is used to validate the Bearer token in requests from other services
    """
    token = credentials.credentials

    if token != settings.BEARER_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong access token",
        )


@dataclass
class TokenData:
    user_id: int
    session_token: UUID4 | None


async def create_token_for_user(user: User) -> str:
    # "exp" -- expiration time of token
    # "sub" -- subject, contains user_id
    # "session_token" -- session_token of registered user
    payload = {
        "exp": datetime.utcnow() + timedelta(days=settings.TOKEN_EXPIRATION_TIME_IN_DAYS),
        "sub": str(user.id),
        "session_token": str(user.session_token)
    }
    encoded_token = jwt.encode(payload,
                               settings.JWT_SECRET,
                               algorithm=settings.JWT_ALGORITHM)

    encrypted_token = jwe.encrypt(bytes(encoded_token, encoding='utf-8'),
                                  settings.JWE_SECRET,
                                  encryption=settings.JWE_ENCRYPTION_ALGORITHM)

    return encrypted_token.decode("utf-8")


async def get_values_from_token(token: str):
    jwe_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid token",
    )

    try:
        decrypted_token = jwe.decrypt(token, settings.JWE_SECRET)

        payload = jwt.decode(decrypted_token,
                             settings.JWT_SECRET,
                             algorithms=[settings.JWT_ALGORITHM],
                             require=["exp", "sub", "session_token"])

        session_token: UUID4 | str | None = payload.get("session_token")
        if session_token == 'None':
            session_token = None

        user_id: int = payload.get("sub")

        token_data = TokenData(user_id=user_id, session_token=session_token)
    except JOSEError:
        raise jwe_exception
    except PyJWTError:
        raise expired_exception

    return token_data


async def get_id_by_token(token: str) -> int:
    user_properties = await get_values_from_token(token)

    # verify token if user is registered
    if user_properties.session_token is not None:
        async with AsyncSessionLocal() as session:
            async with session.begin():
                registered_user = await crud_user.get_object_by_id(db=session,
                                                                   requested_id=user_properties.user_id)
        if user_properties.session_token != registered_user.session_token:
            raise expired_exception

    return user_properties.user_id
