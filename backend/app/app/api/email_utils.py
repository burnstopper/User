from datetime import datetime, timedelta
from pydantic import UUID4, EmailStr
from jinja2 import Environment, FileSystemLoader
from jose import jwe

from fastapi import HTTPException, status, Depends
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.crud.email import crud_email
from app.crud.verification_requests import crud_login_request, crud_registration_request
from app.database.dependencies import get_db
from app.schemas.verification_requests import RegistrationRequestCreate
from app.models.verification_requests import RegistrationRequest, LoginRequests

from app.core.config import settings

email_conf = ConnectionConfig(
    MAIL_USERNAME="ulkhan.2014@mail.ru",
    MAIL_PASSWORD="4fxEJPhJmQ5vKDbCw2P2",
    MAIL_FROM="ulkhan.2014@mail.ru",
    MAIL_PORT=465,
    MAIL_SERVER="smtp.mail.ru",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


async def verify_email(request_id: int, email_to_verify: EmailStr):
    request_id_hashed = jwe.encrypt(bytes(str(request_id), encoding='utf-8'),
                                    settings.JWE_SECRET,
                                    encryption=settings.JWE_ENCRYPTION_ALGORITHM).decode("utf-8")

    environment = Environment(loader=FileSystemLoader("templates/"))
    template = environment.get_template("registration_email.html")

    # TEMPORARY FOR DEMONSTRATION PURPOSES
    content = template.render(link_to_send="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                              request_id_hashed=request_id_hashed)

    message = MessageSchema(
        subject="Подтверждение регистрации на Burnout tester",
        recipients=[email_to_verify],
        body=content,
        subtype=MessageType.html,
    )
    fm = FastMail(email_conf)
    await fm.send_message(message)
