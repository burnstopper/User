from sqlalchemy.orm import as_declarative, declared_attr


# using declarative style
@as_declarative()
class Base:
    __name__: str

    # generate __tablename__ automatically
    @declared_attr
    def __tablename__(self) -> str:
        return self.__name__.lower()
