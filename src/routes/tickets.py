from fastapi import APIRouter, Depends, HTTPException, Form, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from src.database import get_db
from src.models.Users import User
from src.models.Tickets import Ticket
from src.models.Threads import Thread
from src.utils.hashing import verify_password
from src.utils.jwt_handler import create_access_token
from src.utils.jwt_handler import get_current_user
from typing import Annotated

class InsertHumanEscalation(BaseModel):
    ticket_id: str
    user_id: str
    username: str
    category: str
    title_query: str
    ticket_description: str
    status: str
    created_at: datetime
    intent: str 
    priority: str
    resolution_state: str
    resolved_by: str | None = None

class InsertHumanReview(InsertHumanEscalation):
    ai_response: str
    ai_confidence: float
    retrieved_documents: list[str]

class InsertResolved(InsertHumanReview):
    final_response: str

class UpdateApprovedResponse(BaseModel):
    ticket_id: str
    status: str
    resolution_state: str
    final_response: str
    resolved_by: str

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)

@router.get("/")
def get_tickets(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    tickets = db.query(Ticket).all()

    return tickets

@router.post("/update")
def update_tickets(
    ticket_id: str = Form(...),
    final_response: str = Form(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    try:
        ticket = db.query(Ticket).filter_by(ticket_id=ticket_id).first()
        ticket.final_response=final_response
        ticket.resolution_state = "Closed"
        ticket.resolved_by = "AI+Human"
        ticket.status="Resolved"

        db.commit() # save changes
        db.refresh(ticket) # optional to sync object with DB
        
    finally:
        db.close()
    return {"status": "Updated"}

@router.post("/update/human_eval")
def escalate_to_human(
    human_escalation: InsertHumanEscalation,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):
    try:

        new_ticket = Ticket( **human_escalation.model_dump() )

        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)

        return {
            "message": "Ticket inserted successfully",
            "ticket_id": new_ticket.ticket_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.post("/update/human_review")
def escalate_to_human(
    human_review: InsertHumanReview,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):
    try:

        new_ticket = Ticket( **human_review.model_dump() )

        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)

        return {
            "message": "Ticket inserted successfully",
            "ticket_id": new_ticket.ticket_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.post("/update/auto_resolve")
def escalate_to_human(
    auto_resolve: InsertResolved,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)

):
    try:

        new_ticket = Ticket( **auto_resolve.model_dump() )

        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)

        return {
            "message": "Ticket inserted successfully",
            "ticket_id": new_ticket.ticket_id
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )




@router.patch("/update/approved_response")
def update_approved_response(
    payload: UpdateApprovedResponse,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    try:

        ticket = (
            db.query(Ticket)
            .filter(Ticket.ticket_id == payload.ticket_id)
            .first()
        )

        if not ticket:
            raise HTTPException(
                status_code=404,
                detail="Ticket not found"
            )

        update_data = payload.model_dump(exclude={"ticket_id"})

        for key, value in update_data.items():
            setattr(ticket, key, value)

        db.commit()
        db.refresh(ticket)

        return {
            "message": "Ticket updated successfully"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )