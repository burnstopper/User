from sqlalchemy import Integer, String, Column, DateTime
from datetime import datetime

from app.database.base_class import Base


# https://fastapi.tiangolo.com/tutorial/sql-databases/#create-the-database-models
# no need for __tablename__ because of declarative style (app.database.base_class)


# Can not inherit one table class from another without relationship, so using external class for common fields
class VerificationRequestsBase:
    # unique and index constraints are redundant in case of single column of "Integer" type
    # https://www.sqlite.org/lang_createtable.html#rowid
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)

    # DateTime, needed to delete records after time expires
    creation_datetime = Column(DateTime,
                               default=datetime.now,
                               nullable=False)


class LoginRequests(VerificationRequestsBase, Base):
    pass


class RegistrationRequest(VerificationRequestsBase, Base):
    email_address = Column(String, nullable=False, unique=True)
