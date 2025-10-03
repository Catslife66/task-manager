from sqlmodel import Session, SQLModel, create_engine
from . import settings

database_url = settings.DATABASE_URL
print(database_url)
engine = create_engine(database_url, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session