from datetime import datetime 
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlmodel import Session, select
from decouple import config as decouple_config

from src.db import get_session
from src.users.helpers import (
    REFRESH_TOKEN_EXPIRE_MINUTE,
    SESSION_COOKIE_EXPIRE_MINUTE,
    create_raw_token,
    create_session_cookie,
    create_tokens, 
    get_current_user, 
    hash_password,
    hash_reset_token, 
    verify_password, 
    verify_token
)
from src.users.schemas import (
    TokenSchema, 
    UserCreateSchema, 
    UserInSchema, 
    UserReadSchema,
    ForgotPasswordRequestSchema,
    PasswordResetRequestSchema
)
from src.models import PasswordReset, User
from src.users.csrf import create_csrf_token, csrf_protect
from .email_sender import send_password_change_email 

router = APIRouter()

REFRESH_TOKEN_NAME = 'refresh_token'
CSRF_TOKEN_NAME = 'csrf_token'
SESSION_COOKIE_NAME = "session"
IS_PROD_MODE = decouple_config("IS_PROD_MODE", cast=bool, default=False)

USER_NOT_FOUND_ERR = {"code": "NOT FOUND", "message": "User is not found."}
USER_CONFLICT_ERR = {
    "code": "DUPLICATE", 
    "message": "This email has been registered."
}
USER_UNAUTH_ERR =  {
    "code": "UNAUTHORIZED", 
    "message": "Invalid credentials."
}
NO_REFRESH_TOKEN_ERR = {
    "code": "UNAUTHORIZED", 
    "message": "Missing refresh token."
}
INVALID_REFRESH_TOKEN_ERR = {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired refresh token."
}
INVALID_TOKEN_ERR = {
    "code": "UNAUTHORIZED",
    "message": "Invalid token payload."
}
PASSWORD_RESET_ERR = {
    "code": "INVALID OR EXPIRED",
    "message": "The password reset token is invalid or has expired."
}

def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    response.set_cookie(
        REFRESH_TOKEN_NAME,
        refresh_token,
        httponly=True,
        secure=IS_PROD_MODE,
        samesite="lax",
        path="/api/users/refresh",
        max_age=REFRESH_TOKEN_EXPIRE_MINUTE * 60,
    )

def _set_csrf_cookie(response: Response, csrf_token: str) -> None:
    response.set_cookie(
        CSRF_TOKEN_NAME,
        csrf_token,
        httponly=False,
        secure=IS_PROD_MODE,
        samesite="lax",
        path="/",
    )

def _set_session_cookie(response: Response, session_jwt: str) -> None:
    response.set_cookie(
        SESSION_COOKIE_NAME,
        session_jwt,
        httponly=True,
        secure=IS_PROD_MODE,
        samesite="lax",
        path="/",
        max_age=SESSION_COOKIE_EXPIRE_MINUTE * 60,
    )

@router.get("/", response_model=list[UserReadSchema])
def get_users(session: Session=Depends(get_session)):
    users = session.exec(select(User)).all()
    return users

@router.get("/{user_id}", response_model=UserReadSchema)
def get_user(user_id:int, session: Session=Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=USER_NOT_FOUND_ERR
        )
    return user

@router.delete("/{user_id}")
def delete_user(user_id:int, session: Session=Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_ERR)
    session.delete(user)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/register", response_model=UserReadSchema)
def register_user(payload: UserCreateSchema, session: Session = Depends(get_session)):
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=USER_CONFLICT_ERR)
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=USER_UNAUTH_ERR)
    access_token, refresh_token = create_tokens(data={"sub": user.email})
    csrf_token = create_csrf_token()
    session_cookie = create_session_cookie(data={"sub": user.email}) 
    _set_refresh_cookie(response, refresh_token)
    _set_csrf_cookie(response, csrf_token)
    _set_session_cookie(response, session_cookie)
    return TokenSchema(access_token=access_token)

@router.post("/refresh", response_model=TokenSchema, dependencies=[Depends(csrf_protect)])
def refresh_tokens(
    request: Request,
    response: Response,
    session: Session = Depends(get_session)
):
    refresh_token = request.cookies.get(REFRESH_TOKEN_NAME)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=NO_REFRESH_TOKEN_ERR)
    try:
        payload = verify_token(refresh_token)
        if not payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_REFRESH_TOKEN_ERR)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_TOKEN_ERR)
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_ERR)
        access_token, new_refresh_token = create_tokens(data={"sub": user.email})
        csrf_token = create_csrf_token()
        session_cookie = create_session_cookie(data={"sub": user.email}) 
        _set_refresh_cookie(response, new_refresh_token)
        _set_csrf_cookie(response, csrf_token)
        _set_session_cookie(response, session_cookie)
        return TokenSchema(access_token=access_token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=INVALID_REFRESH_TOKEN_ERR)

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
        samesite="lax",
        path="/"
    )
    response.delete_cookie(
        SESSION_COOKIE_NAME, 
        httponly=True, 
        secure=IS_PROD_MODE, 
        samesite="lax", 
        path="/", 
    )
    return

@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequestSchema,
    request: Request,
    session: Session = Depends(get_session)
):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_ERR)
    raw_token = create_raw_token()
    reset_ps = PasswordReset(
        user_id=user.id,
        hashed_token=hash_reset_token(raw_token),
    )
    session.add(reset_ps)
    session.commit()

    base = request.headers.get("origin", "http://localhost:3000")
    url = f"{base}/reset-password?token={raw_token}"
    send_password_change_email(user.email, url)  

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post("/reset-password", response_model=TokenSchema)
def reset_password(
    payload: PasswordResetRequestSchema,
    session: Session = Depends(get_session)
):
    hashed_token = hash_reset_token(payload.token)
    new_ps = session.exec(
        select(PasswordReset).where(
            (PasswordReset.hashed_token == hashed_token) &
            (PasswordReset.used == False) &
            (PasswordReset.expires_at > datetime.now())
        )
    ).first()
    if not new_ps:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=PASSWORD_RESET_ERR
        )
    user = session.get(User, new_ps.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=USER_NOT_FOUND_ERR)
    
    user.hashed_password = hash_password(payload.new_password)
    new_ps.used = True
    session.add_all([user, new_ps])
    session.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)