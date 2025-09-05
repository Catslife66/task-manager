from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlmodel import Session, select
from decouple import config as decouple_config

from src.db import get_session
from src.users.helpers import (
    REFRESH_TOKEN_EXPIRE_MINUTE,
    create_tokens, 
    get_current_user, 
    hash_password, 
    verify_password, 
    verify_token
)
from src.users.schemas import TokenSchema, UserCreateSchema, UserInSchema, UserReadSchema
from src.models import User
from src.users.csrf import create_csrf_token, csrf_protect 

router = APIRouter()

REFRESH_TOKEN_NAME = 'refresh_token'
CSRF_TOKEN_NAME = 'csrf_token'
IS_PROD_MODE = decouple_config("IS_PROD_MODE", cast=bool, default=False)

@router.get("/", response_model=list[UserReadSchema])
def get_users(session: Session=Depends(get_session)):
    users = session.exec(select(User)).all()
    return users

@router.get("/{user_id}", response_model=UserReadSchema)
def get_user(user_id:int, session: Session=Depends(get_session)):
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"message": IS_PROD_MODE}

@router.delete("/{user_id}")
def delete_user(user_id:int, session: Session=Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    session.delete(user)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/register", response_model=UserReadSchema)
def register_user(payload: UserCreateSchema, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token, refresh_token = create_tokens(data={"sub": user.email})
    csrf_token = create_csrf_token()
    # store refresh and csrf in cookies
    response.set_cookie(
        REFRESH_TOKEN_NAME,
        refresh_token,
        httponly=True,
        secure=IS_PROD_MODE,
        samesite="lax",
        path="/api/users/refresh",
        max_age=REFRESH_TOKEN_EXPIRE_MINUTE*60
    )
    response.set_cookie(
        CSRF_TOKEN_NAME,
        csrf_token,
        httponly=False,
        secure=IS_PROD_MODE,
        samesite="lax",
        path="/"
    )
    return TokenSchema(access_token=access_token)

@router.post("/refresh", response_model=TokenSchema, dependencies=[Depends(csrf_protect)])
def refresh_tokens(
    request: Request,
    response: Response,
    session: Session = Depends(get_session)
):
    refresh_token = request.cookies.get(REFRESH_TOKEN_NAME)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token.")
    try:
        payload = verify_token(refresh_token)
        if not payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        access_token, new_refresh_token = create_tokens(data={"sub": user.email})
        response.set_cookie(
            REFRESH_TOKEN_NAME,
            new_refresh_token,
            httponly=True,
            secure=IS_PROD_MODE,
            samesite='lax',
            path="/api/users/refresh",
            max_age=REFRESH_TOKEN_EXPIRE_MINUTE*60
        )
        csrf = create_csrf_token()
        response.set_cookie(
            "csrf_token",
            csrf,
            httponly=False,
            secure=IS_PROD_MODE,
            samesite="lax",
            path="/"
        )
        return TokenSchema(access_token=access_token)
    except HTTPException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

@router.post("/verify", response_model=UserReadSchema)
def verify_user(current_user: Annotated[User, Depends(get_current_user)]):
   return current_user    

@router.post('/logout', dependencies=[Depends(csrf_protect)])
def logout_user(response:Response):
    response.delete_cookie(
        REFRESH_TOKEN_NAME,
        httponly=True,
        secure=IS_PROD_MODE,
        samesite='lax',
        path="/api/users/refresh",
    )
    response.delete_cookie(
        CSRF_TOKEN_NAME,
        httponly=False,
        secure=IS_PROD_MODE,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)