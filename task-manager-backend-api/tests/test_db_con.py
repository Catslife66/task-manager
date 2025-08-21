import pytest
from sqlalchemy import text
from sqlmodel import Session


def test_db_connection(engine):
    try:
        with Session(engine) as session:
            result = session.exec(text("SELECT 1"))
            assert result.scalar() == 1
    except Exception as e:
        pytest.fail(f"Database connection failed: {e}")

def test_db_config(database_url):
    assert database_url is not None
    assert database_url.startswith("postgresql+psycopg2://")
