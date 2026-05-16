from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from fastapi import Body, Form
from langgraph.types import Command, interrupt
from src.state import UserContext
from typing import Annotated, Union, Literal
from src.database import get_db
from src.models.Users import User
from src.models.Tickets import Ticket
from src.models.Threads import Thread
from src.utils.hashing import verify_password
from src.utils.jwt_handler import get_current_user
from src.utils.jwt_handler import create_access_token
from uuid import uuid4
from datetime import datetime
from src.utils.init_db import init_db
from src.graph import agent
from pydantic import BaseModel
import requests
from fastapi.encoders import jsonable_encoder


class InputTicket(BaseModel):
    ticket_id: str
    user_id: str
    username: str
    title_query: str
    ticket_description: str
    token: str
class ResumeGraph(BaseModel):
    thread_id: str
    final_response: str
    user_id: str
    username: str
    token: str



init_db()




router = APIRouter(
    prefix="/agent",
    tags=["Agent"]
)

@router.post("/execute")
def execute_ticekt(
    input_ticket: InputTicket,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
                   
):
    thread_id=str(uuid4())

    config={
        "configurable": {
                    "thread_id": thread_id,
                }
    }
    ticket={
    "incident_id": input_ticket.ticket_id,
    "incident_title": input_ticket.title_query,
    "incident_sender": input_ticket.username,
    "incident_description": input_ticket.ticket_description
    }
    result=agent.invoke(ticket,context=UserContext(userid=input_ticket.user_id, username=input_ticket.username, access_token=input_ticket.token),config=config)
    try:
        print(result["__interrupt__"])
        url = "http://127.0.0.1:8000/threads/insert"

        payload = {
            "thread_id": thread_id,
            "ticket_id": input_ticket.ticket_id,
            "current_state": jsonable_encoder(result)
            
        }

        headers = {
            "Authorization": f"Bearer {input_ticket.token}"
        }

        response = requests.post(
            url,
            json=payload,
            headers=headers
        )
        print(response.json())

        return response.json()
    except Exception as e:
        print(e)
        return result


@router.post("/resume")
def resume_graph(
    resume_ticket: ResumeGraph,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
                   
):
    config={
        "configurable": {
                    "thread_id": resume_ticket.thread_id,
                }
    }

    print(resume_ticket)
    
    result=agent.invoke(Command(resume=resume_ticket.final_response),context=UserContext(userid=resume_ticket.user_id, username=resume_ticket.username, access_token=resume_ticket.token),config=config)
    url = "http://127.0.0.1:8000/threads/update/thread"
    payload = {
        "thread_id": resume_ticket.thread_id,        
        "status": "Resolved",
        "resume_answer": resume_ticket.final_response
        
    }
    print(payload)
    
    token = resume_ticket.token
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.patch(
        url,
        json=payload,
        headers=headers
    )
    return response.json()
