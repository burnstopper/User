from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.user import user
from app.database.dependencies import get_db

from app.api.auth import create_token_for_user, get_id_by_token

user_router = APIRouter()


@user_router.post("/new_respondent", status_code=201)
async def create_anonymous_respondent(db: Session = Depends(get_db)) -> str:
    """
    Create new anonymous user.
    """
    new_user = await user.create(db=db)
    return await create_token_for_user(new_user)


@user_router.get("/{user_token}", status_code=200)
async def get_user_id_by_token(user_token: str) -> int:
    """
    Get ID of the user by token.
    """
    return get_id_by_token(user_token)
