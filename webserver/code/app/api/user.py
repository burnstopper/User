from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse

from sqlalchemy.orm import Session

from app.crud.user import user
from app.database.dependencies import get_db

from app.api.auth import create_token_for_user, get_id_by_token

user_router = APIRouter()

# PlainTextResponse essential not to add any quotes in Response


@user_router.post("/new_respondent", status_code=201, response_class=PlainTextResponse)
async def create_anonymous_respondent(db: Session = Depends(get_db)) -> str:
    """
    Create new anonymous user.
    """
    new_user = await user.create(db=db)
    return await create_token_for_user(new_user)


@user_router.get("/{user_token}", status_code=200, response_class=PlainTextResponse)
async def get_user_id_by_token(user_token: str) -> str:
    """
    Get ID of the user by token.
    """
    # str is required because of PlainTextResponse (without str current Docker container fail to encode it)
    return str(await get_id_by_token(user_token))
