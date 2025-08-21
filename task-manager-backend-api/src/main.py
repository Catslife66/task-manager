from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
)

app.include_router(tasks_router, prefix="/api", tags=["task_tags"])
app.include_router(users_router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {"Hello": "World"}

