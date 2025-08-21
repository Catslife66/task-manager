from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from src.db import get_session
from src.models import Task, Tag, User
from src.users.helpers import get_current_user
from .schemas import TagCreateSchema, TagUpdateSchema, TagReadSchema, TaskCreateSchema, TaskReadSchema, TaskUpdateSchema

router = APIRouter()

"""
Tag management routes
"""

@router.get("/tags", response_model=list[TagReadSchema])
def get_tags(session: Session = Depends(get_session)):
    tags = session.exec(select(Tag)).all()
    return tags

@router.get("/tags/{tag_id}", response_model=TagReadSchema)
def get_tag(tag_id: int, session: Session = Depends(get_session)):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.post("/tags", response_model=Tag)
def create_tag(payload: TagCreateSchema, session: Session = Depends(get_session)):
    tag = Tag(name=payload.name)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag

@router.patch("/tags/{tag_id}", response_model=TagReadSchema)
def update_tag(tag_id: int, payload: TagUpdateSchema, session: Session = Depends(get_session)):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag.name = payload.name
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag

@router.delete("/tags/{tag_id}", response_model=TagReadSchema)
def delete_tag(tag_id: int, session: Session = Depends(get_session)):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    session.delete(tag)
    session.commit()
    return JSONResponse(
        status_code=204,
        content={"message": "Tag deleted successfully"})


"""
Task management routes
"""
@router.get("/tasks", response_model=list[TaskReadSchema])
def get_tasks(session: Session = Depends(get_session)):
    tasks = session.exec(select(Task)).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskReadSchema)
def get_task(task_id:int, session: Session=Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks/user", response_model=list[TaskReadSchema])
def get_user_tasks(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session),
    q: str | None = Query(None),

):
    tasks = session.exec(select(Task).where(Task.user_id == current_user.id)).all()
    if q:
        tasks = tasks.where(Task.title.contains(q) | Task.description.contains(q))
    return tasks

@router.post("/tasks", response_model=TaskReadSchema)
def create_task(
    payload: TaskCreateSchema, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    task = Task(
        **payload.model_dump(exclude={'user_id'}),
        user_id=current_user.id,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.patch("/tasks/{task_id}", response_model=TaskReadSchema)
def update_task(task_id:int, payload:TaskUpdateSchema, session: Session=Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.id != task.user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this task")
    
    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.is_completed is not None:
        task.is_completed = payload.is_completed
    if payload.tag_id is not None:
        task.tag_id = payload.tag_id
    
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/tasks/{task_id}", response_model=TaskReadSchema)
def delete_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.id != task.user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this task")
    
    session.delete(task)
    session.commit()
    return JSONResponse(
        status_code=204,
        content={"message": "Task deleted successfully"}
    )
