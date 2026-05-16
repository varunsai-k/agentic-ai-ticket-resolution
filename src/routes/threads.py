from fastapi import APIRouter, Depends, HTTPException, Form, Body, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime
from src.database import get_db
from src.models.Users import User
from src.models.Tickets import Ticket
from src.models.Threads import Thread
from src.utils.hashing import verify_password
from src.utils.jwt_handler import create_access_token
from src.utils.jwt_handler import get_current_user
from typing import Annotated
from datetime import datetime

router = APIRouter(
    prefix="/threads",
    tags=["Threads"]
)

class NewThread(BaseModel):
    thread_id: str
    ticket_id: str
    current_node: str = "Human Review"
    current_state: dict
    status: str = "Running"
    interrupt_reason: str = "Low confidence flagged for review"
    last_run_at: datetime = Field(default_factory=datetime.now)

class UpdateThread(BaseModel):
    thread_id: str
    current_node: str = "send_approved_response"
    status: str = "Running"
    resume_answer: str
    last_run_at: datetime = Field(default_factory=datetime.now)


@router.get("/thread")
def get_thread(
    ticket_id: str= Query(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):
    
    ticket = (
        db.query(Thread)
        .filter(Thread.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )
    return {"thread_id":ticket.thread_id}


    

@router.post("/insert")
def insert_thread(
    new_thread: NewThread,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    try:

        new_ticket = Thread( **new_thread.model_dump() )

        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)

        return {
            "message": "Thread inserted successfully",
            "thread_id": new_ticket.thread_id,
            "ticket_id": new_ticket.ticket_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.patch("/update/thread")
def update_approved_response(
    payload: UpdateThread,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    try:

        ticket = (
            db.query(Thread)
            .filter(Thread.thread_id == payload.thread_id)
            .first()
        )

        if not ticket:
            raise HTTPException(
                status_code=404,
                detail="Ticket not found"
            )

        update_data = payload.model_dump(exclude={"thread_id"})

        for key, value in update_data.items():
            setattr(ticket, key, value)

        db.commit()
        db.refresh(ticket)

        return {
            "message": "Thread updated successfully"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
