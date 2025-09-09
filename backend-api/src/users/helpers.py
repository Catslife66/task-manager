from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from decouple import config
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select

from src.db import get_session
from src.models import User


SECRET_KEY = config("AUTHJWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_MINUTE = 60*24*3
SESSION_COOKIE_EXPIRE_MINUTE = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

TOKEN_EXPIRY_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token has expired",
    headers={"WWW-Authenticate": "Bearer"},
)

TOKEN_INVALID_EXCEPTION= HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token is invalid",
    headers={"WWW-Authenticate": "Bearer"},
)

def hash_password(password: str):
    return pwd_context.hash(password)
   
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTE)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_tokens(data: dict) -> tuple[str, str]:
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    return access_token, refresh_token

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except InvalidTokenError:
        raise TOKEN_INVALID_EXCEPTION
    except ExpiredSignatureError:
        raise TOKEN_EXPIRY_EXCEPTION

def verify_token(token: str):
    payload = decode_token(token)
    email = payload.get("sub")
    if email is None:
        raise CREDENTIALS_EXCEPTION
    return payload

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    payload = verify_token(token)
    email = payload.get("sub")
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise CREDENTIALS_EXCEPTION
    return user

def create_session_cookie(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=SESSION_COOKIE_EXPIRE_MINUTE)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt