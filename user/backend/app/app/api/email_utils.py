from pydantic import EmailStr
from jinja2 import Environment, FileSystemLoader
from base64 import urlsafe_b64encode, urlsafe_b64decode
from Crypto.Cipher import AES
from fastapi import HTTPException, status
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.core.config import settings

email_conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


def encrypt_id(raw_id: int) -> str:
    id_cipher = AES.new(bytes(settings.JWE_SECRET, encoding='utf-8'), mode=AES.MODE_OPENPGP)
    encrypted_id = id_cipher.encrypt(bytes(str(raw_id), encoding='utf-8'))
    # https://gist.github.com/cameronmaske/f520903ade824e4c30ab?permalink_comment_id=4512100#gistcomment-4512100
    encoded_id = (lambda string: urlsafe_b64encode(string).strip(b"="))(encrypted_id)
    return encoded_id.decode()


def decrypt_id(encrypted_id: str) -> int:
    try:
        # https://gist.github.com/cameronmaske/f520903ade824e4c30ab?permalink_comment_id=4512100#gistcomment-4512100
        unb64_ciphertext = (lambda string: urlsafe_b64decode((string + (b"=" * (4 - (len(string) % 4))))))(
            encrypted_id.encode()
        )
        iv = unb64_ciphertext[0:18]
        unb64_ciphertext = unb64_ciphertext[18:]
        #  https://github.com/Legrandin/pycryptodome/blob/v3.7.2/lib/Crypto/Cipher/_mode_eax.py#L205
        # A cipher object is stateful: once you have decrypted a message
        #         you cannot decrypt (or encrypt) another message with the same
        #         object.
        id_cipher = AES.new(bytes(settings.JWE_SECRET, encoding='utf-8'), mode=AES.MODE_OPENPGP, iv=iv)
        return int(id_cipher.decrypt(unb64_ciphertext).decode())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid encrypted id",
        )


async def verify_email(request_id: int, email_to_verify: EmailStr, is_registration: bool) -> None:
    request_id_encrypted = encrypt_id(request_id)
    # request_id_hashed = jwe.encrypt(bytes(str(request_id), encoding='utf-8'),
    #                                 settings.JWE_SECRET,
    #                                 encryption=settings.JWE_ENCRYPTION_ALGORITHM).decode("utf-8")

    environment = Environment(loader=FileSystemLoader("app/templates/"))

    if is_registration:
        template_name = "registration_email.html"
        route_to_send = "signup"
    else:
        template_name = "login_email.html"
        route_to_send = "login"
    template = environment.get_template(template_name)

    # TEMPORARY FOR DEMONSTRATION PURPOSES
    content = template.render(link_to_send=f"http://{settings.HOST}:{settings.PORT}/verification/"
                                           f"{route_to_send}/{request_id_encrypted}")

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
