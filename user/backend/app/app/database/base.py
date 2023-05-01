# make sure all SQL Alchemy models are imported (app.db.base) before initializing DB
# otherwise, SQL Alchemy might fail to initialize tables or relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28

from app.database.base_class import Base # noqa
from app.models.user import User # noqa
from app.models.email import Email # noqa
from app.models.verification_requests import LoginRequest, RegistrationRequest # noqa
from app.models.researcher import Researcher # noqa