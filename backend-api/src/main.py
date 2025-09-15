from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .tasks.routes import router as tasks_router
from .users.routes import router as users_router

# the following is for early dev stages where we want to check the database connection
# and initialize the database schema. Once Alembic is set up, this can be removed.
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     init_db()
#     yield

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(tasks_router, prefix="/api", tags=["task_tags"])
app.include_router(users_router, prefix="/api/users", tags=["users"])

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc:HTTPException):
    detail = exc.detail
    if isinstance(detail, dict):
        code = detail.get('code', 'HTTP ERROR')
        msg = detail.get('message', "Request failed.")
        fields = detail.get('fields', {})
    else:
        code = 'HTTP ERROR'
        msg = str(detail) if detail else "Request failed."
        fields = {}
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "errors": {
                "code": code,
                "message": msg,
                "fields": fields
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    fields = {}
    for err in exc.errors():
        loc = err.get('loc', [])
        field = loc[1] if loc else "non_field"
        msg = err.get('msg', "Invalid value input")
        fields[str(field)] = msg

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "errors": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid request body",
                "fields": fields
            }
        }
    )

@app.get("/")
def read_root():
    return {"Hello": "World"}
