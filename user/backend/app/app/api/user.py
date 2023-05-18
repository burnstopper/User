from fastapi import APIRouter, Depends, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.user import crud_user
from app.crud.researcher import crud_researcher
from app.database.dependencies import get_db

from app.api.auth import create_token_for_user, get_id_by_token

user_router = APIRouter()
# PlainTextResponse essential not to add any quotes in Response


@user_router.post("/new_respondent", status_code=status.HTTP_201_CREATED, response_class=PlainTextResponse)
async def create_anonymous_respondent(db: AsyncSession = Depends(get_db)) -> str:
    """
    Create new anonymous user.
    """
    new_user = await crud_user.create(db=db)
    return await create_token_for_user(new_user)


@user_router.get("/{user_token}", status_code=status.HTTP_200_OK, response_class=PlainTextResponse)
async def get_user_id_by_token(user_token: str) -> str:
    """
    Get ID of the user by token.
    """
    # str is required because of PlainTextResponse (without str Docker container fail to encode it)
    return str(await get_id_by_token(user_token))


@user_router.get("/check_researcher/{user_token}", status_code=status.HTTP_200_OK)
async def check_researcher_by_token(user_token: str, db: AsyncSession = Depends(get_db)) -> bool:
    """
    Chekc if the user is researcher by token.
    """
    user_id = await get_id_by_token(user_token)
    return await crud_researcher.check_by_user_id(db=db, requested_id=user_id)
