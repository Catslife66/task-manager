import pytest
from alembic import config, command
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from decouple import config as decouple_config

from src.db import get_session as real_get_session
from src.main import app
from src.models import User, Task, Tag
from src.users.helpers import create_access_token, hash_password
from src.users.csrf import create_csrf_token


TEST_DATABASE_URL = decouple_config("TEST_DATABASE_URL", default="postgresql+psycopg2://taskadmin:taskmanageradmin123@db:5432/test_db")
engine = create_engine(TEST_DATABASE_URL, echo=True)

@pytest.fixture(scope="session")
def database_url():
    return TEST_DATABASE_URL


@pytest.fixture(scope="session")
def engine(database_url):
    return create_engine(database_url, pool_pre_ping=True, echo=False)

@pytest.fixture(scope="session", autouse=True)
def migrate_schema_once(engine):
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    alembic_config = config.Config("alembic.ini")
    alembic_config.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    command.upgrade(alembic_config, "head")
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(scope="function")
def db_session(engine):
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture
def client(db_session):
    def _override_get_session():
        yield db_session
    app.dependency_overrides[real_get_session] = _override_get_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    user = User(
        email="test@test.com",
        hashed_password=hash_password("test_1234")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_tag(db_session):
    tag = Tag(name="Test Tag")
    db_session.add(tag)
    db_session.commit()
    db_session.refresh(tag)
    return tag

@pytest.fixture
def test_task(db_session, test_tag, test_user):
    task = Task(
        title="Test Task",
        description="This is a test task",
        tag_id=test_tag.id,
        user_id=test_user.id,
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task

@pytest.fixture
def auth_headers(test_user):
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def csrf_token_header(client):
    csrf_token = create_csrf_token()
    client.cookies.set("csrf_token", csrf_token)
    return {"x-csrf-token": csrf_token}

@pytest.fixture
def test_task_payload():
    return {
        "title": "New Test Task",
        "description": "This is a test task",
    }