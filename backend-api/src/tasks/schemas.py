from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

from src.models import Priority


class TaskCreateSchema(SQLModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = Field(default=Priority.MEDIUM)
    is_completed: bool = Field(default=False)
    user_id: Optional[int] = None


class TaskUpdateSchema(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = Field(default=Priority.MEDIUM)
    is_completed: Optional[bool] = None
   

class TaskReadSchema(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = Field(default=Priority.MEDIUM)
    is_completed: bool = Field(default=False)
    created_at: datetime
    updated_at: datetime
    user_id: Optional[int] = None
