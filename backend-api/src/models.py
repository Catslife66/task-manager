from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from enum import Enum as PyEnum


class Priority(str, PyEnum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, max_length=100)
    hashed_password: str 
    created_at: datetime = Field(default_factory=datetime.now)

    tasks: list["Task"] = Relationship(back_populates="user")
    password_resets: list["PasswordReset"] = Relationship(back_populates="user")

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Priority = Field(default=Priority.MEDIUM)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    user_id: int | None = Field(default=None, foreign_key="users.id")

    user: Optional[User] = Relationship(back_populates="tasks")


class PasswordReset(SQLModel, table=True):
    __tablename__ = "password_resets"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id")
    hashed_token: str = Field(index=True, unique=True)
    expires_at: datetime = Field(default_factory=lambda: datetime.now() + timedelta(minutes=60))
    used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)

    user: Optional[User] = Relationship(back_populates="password_resets")
