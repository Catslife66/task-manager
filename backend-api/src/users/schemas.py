from pydantic import EmailStr, Field
from sqlmodel import SQLModel


class UserReadSchema(SQLModel):
    id: int
    email: str 


class UserInSchema(SQLModel):
    email: EmailStr = Field(unique=True, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class TokenSchema(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenDataSchema(SQLModel):
    email: str | None = None
