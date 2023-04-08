from fastapi import APIRouter, Depends, status
from fastapi.responses import PlainTextResponse

from app.api.auth import has_access
from app.api.user import user_router, create_anonymous_respondent
from app.api.signing import signing_router

api_router = APIRouter()

# user_router for other backend services, requires Bearer token for access
# this router for frontend of this microservice
api_router.add_api_route("/new_token",
                         create_anonymous_respondent,
                         methods=["POST"],
                         status_code=status.HTTP_201_CREATED,
                         response_class=PlainTextResponse)

api_router.include_router(user_router,
                          dependencies=[Depends(has_access)],
                          prefix="/api/user",
                          tags=["user"])

api_router.include_router(signing_router,
                          tags=["signing"])

