from app.database.base_class import Base

from sqlalchemy import Integer, String, Column


# https://fastapi.tiangolo.com/tutorial/sql-databases/#create-the-database-models
# no need for __tablename__ because of declarative style (app.database.base_class)
class User(Base):
    # unique and index constraints are redundant in case of single column of "Integer" type
    # https://www.sqlite.org/lang_createtable.html#rowid
    id = Column(Integer, primary_key=True)
    session_token = Column(String, nullable=True)
