from pydantic import EmailStr
from jinja2 import Environment, FileSystemLoader
from jose import jwe
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import settings

email_conf = ConnectionConfig(
    MAIL_USERNAME="ulkhan.2014@mail.ru",
    MAIL_PASSWORD="*",
    MAIL_FROM="ulkhan.2014@mail.ru",
    MAIL_PORT=465,
    MAIL_SERVER="smtp.mail.ru",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


async def verify_email(request_id: int, email_to_verify: EmailStr, is_registration: bool) -> None:
    request_id_hashed = jwe.encrypt(bytes(str(request_id), encoding='utf-8'),
                                    settings.JWE_SECRET,
                                    encryption=settings.JWE_ENCRYPTION_ALGORITHM).decode("utf-8")

    environment = Environment(loader=FileSystemLoader("templates/"))

    if is_registration:
        template_name = "registration_email.html"
    else:
        template_name = "login_email.html"
    template = environment.get_template(template_name)

    # TEMPORARY FOR DEMONSTRATION PURPOSES
    content = template.render(link_to_send="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                              request_id_hashed=request_id_hashed)

    if is_registration:
        subject = "Подтверждение регистрации на Burnout tester"
    else:
        subject = "Подтверждение входа в Burnout tester"

    message = MessageSchema(
        subject=subject,
        recipients=[email_to_verify],
        body=content,
        subtype=MessageType.html,
    )
    fm = FastMail(email_conf)
    await fm.send_message(message)
