from datetime import datetime, timedelta

from pydantic import UUID4

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from jose import jwe
import jwt
from jose.exceptions import JOSEError
from jwt import PyJWTError

from app.core.config import settings
from app.schemas.user import User

from dataclasses import dataclass

security = HTTPBearer()


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
        "exp": datetime.utcnow() + timedelta(days=settings.TOKEN_EXPIRE_TIME_IN_DAYS),
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
    jwt_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Expired token",
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
        raise jwt_exception

    # TBD with adding registered users:
    # if session_token != None --- verify it

    return token_data


async def get_id_by_token(token: str):
    return (await get_values_from_token(token)).user_id
