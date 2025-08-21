from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from src.db import get_session
from src.users.helpers import create_access_token, get_current_user, hash_password, verify_password
from src.users.schemas import TokenSchema, UserInSchema, UserReadSchema
from src.models import User 

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 60

@router.get("/", response_model=list[UserReadSchema])
def get_users(session: Session=Depends(get_session)):
    users = session.exec(select(User)).all()
    return users

@router.get("/{user_id}", response_model=UserReadSchema)
def get_user(user_id:int, session: Session=Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserReadSchema)
def create_user(payload: UserInSchema, session: Session=Depends(get_session)):
    user = User(email=payload.email)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id:int, session: Session=Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return JSONResponse(status_code=204, content={"message": "User deleted successfully"})


@router.post("/register", response_model=UserReadSchema)
def register_user(payload: UserInSchema, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hp = hash_password(payload.password)
    user = User(email=payload.email, hashed_password=hp)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login", response_model=TokenSchema)
def login_user(
        payload: UserInSchema,
        session: Session = Depends(get_session)
    ):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires,
    )
    return TokenSchema(access_token=access_token, token_type="bearer")
    
@router.post("/me", response_model=UserReadSchema)
def user_me(current_user: Annotated[User, Depends(get_current_user)]):
   return current_user