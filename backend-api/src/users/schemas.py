from pydantic import EmailStr, Field, AfterValidator
from sqlmodel import SQLModel
from typing_extensions import Annotated
from .validators import check_password_strength


class UserReadSchema(SQLModel):
    id: int
    email: EmailStr 


class UserCreateSchema(SQLModel):
    email: EmailStr = Field(unique=True, max_length=100)
    password: Annotated[str, AfterValidator(check_password_strength)]


class UserInSchema(SQLModel):
    email: EmailStr = Field(unique=True, max_length=100)
    password: str


class TokenSchema(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenDataSchema(SQLModel):
    email: EmailStr | None = None


class ForgotPasswordRequestSchema(SQLModel):
    email: EmailStr


class PasswordResetRequestSchema(SQLModel):
    token: str = Field(min_length=10, max_length=400)
    new_password: Annotated[str, AfterValidator(check_password_strength)]