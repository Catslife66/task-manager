from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class TagCreateSchema(SQLModel):
    name: str = Field(unique=True, max_length=50)


class TagUpdateSchema(SQLModel):
    name: str = Field(unique=True, max_length=50)


class TagReadSchema(SQLModel):
    id: int
    name: str = Field(unique=True, max_length=50)
    created_at: datetime
    updated_at: datetime


class TaskCreateSchema(SQLModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: bool = Field(default=False)
    tag_id: Optional[int] = None
    user_id: Optional[int] = None


class TaskUpdateSchema(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    tag_id: Optional[int] = None
   

class TaskReadSchema(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: bool = Field(default=False)
    created_at: datetime
    updated_at: datetime
    tag_id: Optional[int] = None
    user_id: Optional[int] = None
