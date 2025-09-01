from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from sqlmodel import Session, select

from src.db import get_session
from src.users.helpers import (
    create_tokens, 
    get_current_user, 
    hash_password, 
    verify_password, 
    verify_token
)
from src.users.schemas import TokenSchema, UserInSchema, UserReadSchema
from src.models import User
from src.users.csrf import create_csrf_token 

router = APIRouter()

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
    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/login", response_model=TokenSchema)
def login_user(
        payload: UserInSchema,
        response: Response,
        session: Session = Depends(get_session),
    ):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token, refresh_token = create_tokens( data={"sub": user.email})
    # issue crsf token when a session starts and store it in a cookie
    csrf = create_csrf_token()
    response.set_cookie(
        "csrf_token",
        csrf,
        httponly=False,
        secure=True,
        samesite="lax",
        path="/"
    )
    return TokenSchema(
        access_token=access_token, 
        refresh_token=refresh_token, 
        token_type="bearer"
    )

@router.post("/verify", response_model=UserReadSchema)
def verify_user(current_user: Annotated[User, Depends(get_current_user)]):
   return current_user

@router.post("/refresh", response_model=TokenSchema)
def refresh_tokens(
    refresh_token: str,
    response: Response,
    session: Session = Depends(get_session)
):
    try:
        payload = verify_token(refresh_token)
        email = payload.get("sub")
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        access_token, new_refresh_token = create_tokens(data={"sub": user.email})
        csrf = create_csrf_token()
        response.set_cookie(
            "csrf_token",
            csrf,
            httponly=False,
            secure=True,
            samesite="lax",
            path="/"
        )
        return TokenSchema(
            access_token=access_token, 
            refresh_token=new_refresh_token, 
            token_type="bearer"
        )
    except HTTPException as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    