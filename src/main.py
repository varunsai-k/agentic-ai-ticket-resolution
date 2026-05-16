from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from src.utils.init_db import init_db
from src.routes import auth, threads
from src.routes import tickets, agent

app = FastAPI()
app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(agent.router)
app.include_router(threads.router)

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:8501"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

@app.on_event("startup")
def startup():

    init_db()




