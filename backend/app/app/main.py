from fastapi import FastAPI
from datetime import timedelta

from app.api.routers import api_router
from app.core.config import settings
from app.database.session import scheduler, schedule_params, scheduled_delete_of_expired_requests
from app.crud.verification_requests import crud_registration_request, crud_login_request

app = FastAPI()
app.include_router(api_router)


@app.on_event("startup")
async def startup_event():
    scheduler.add_job(kwargs=dict(crud_delete=crud_registration_request.delete_expired_requests,
                                  expiration_time=timedelta(minutes=settings.REQUESTS_EXPIRATION_TIME_IN_MINUTES),
                                  ),
                      **schedule_params)
    scheduler.add_job(kwargs=dict(crud_delete=crud_login_request.delete_expired_requests,
                                  expiration_time=timedelta(minutes=settings.REQUESTS_EXPIRATION_TIME_IN_MINUTES),
                                  ),
                      **schedule_params)
    scheduler.start()


@app.on_event("shutdown")
async def shutdown_event():
    # on shutdown delete all verification requests
    await scheduled_delete_of_expired_requests(crud_registration_request.delete_expired_requests, timedelta(0))
    await scheduled_delete_of_expired_requests(crud_login_request.delete_expired_requests, timedelta(0))


if __name__ == "__main__":
    # Use this for debugging purposes only
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8002, log_level="debug")
