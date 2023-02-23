from fastapi import APIRouter, Depends

from app.api import user
from app.api.auth import has_access


api_router = APIRouter()
api_router.include_router(user.user_router,
                          dependencies=[Depends(has_access)],
                          prefix="/user",
                          tags=["user"])
