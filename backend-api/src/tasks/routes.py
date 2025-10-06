from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlmodel import Session, select
from src.db import get_session
from src.models import Task, User
from src.users.helpers import get_current_user
from .schemas import PaginatedTaskSchema, TaskCreateSchema, TaskReadSchema, TaskUpdateSchema

router = APIRouter()

"""
Task management routes
"""
TASK_NOT_FOUND_ERR = {
    "code": "NOT FOUND", 
    "message": "Task is not found."
}
NO_PERMISSION_ERR = {
    "code": "FORBIDDEN", 
    "message": "You do not have permission to read/update/delete this task."
}

@router.get("/tasks", response_model=list[TaskReadSchema])
def get_tasks(session: Session = Depends(get_session)):
    tasks = session.exec(select(Task)).all()
    return tasks

@router.get("/tasks/user", response_model=PaginatedTaskSchema)
def get_user_tasks(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session),
    offset: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    is_completed: bool | None = Query(None),
): 
    base_q = select(Task).where(Task.user_id == current_user.id)
    all_tasks = session.exec(base_q).all()
    total = len(all_tasks)

    if is_completed is not None:
        base_q = base_q.where(Task.is_completed == is_completed)

    limited_q = base_q.offset(offset).limit(limit)
    paginated_tasks = session.exec(limited_q).all()
    
    has_next = (offset + len(paginated_tasks)) < total

    result = PaginatedTaskSchema(
        items=paginated_tasks,
        total=total,
        limit=limit,
        offset=offset,
        has_next=has_next,
    )

    return result



@router.get("/tasks/{task_id}", response_model=TaskReadSchema)
def get_task(task_id:int, session: Session=Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=TASK_NOT_FOUND_ERR
        )
    return task

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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=TASK_NOT_FOUND_ERR)
    if current_user.id != task.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=NO_PERMISSION_ERR)
    
    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.due_date is not None:
        task.due_date = payload.due_date
    if payload.priority is not None:
        task.priority = payload.priority
    if payload.is_completed is not None:
        task.is_completed = payload.is_completed

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/tasks/{task_id}", response_model=TaskReadSchema)
def delete_task(task_id: int, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=TASK_NOT_FOUND_ERR)
    if current_user.id != task.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=NO_PERMISSION_ERR)
    
    session.delete(task)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
