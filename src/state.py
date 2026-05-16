from pydantic import BaseModel
from typing import Literal, List, Annotated
from dataclasses import dataclass
from langgraph.graph import add_messages
from langchain.messages import AnyMessage

@dataclass
class UserContext:
    userid: str
    username: str
    access_token: str

class IncidentClassification(BaseModel):
    category: Literal["Support","Commerce","Technical","Product"]
    intent: Literal["Order Issue","Payment/Billing","Technical Bug","Account Access","Product Inquiry","Feature Request"]
    urgency: Literal["Low","Medium","High"]

class IncidentState(BaseModel):
    # Dynamic Incident context
    incident_id: str
    incident_title: str
    incident_sender: str
    incident_description: str
    
    # Incident Classification
    classification: IncidentClassification | None = None
    status: str | None = None
    #Historic Data
    history_incidents: List[str] | None = []
    relevant_docs: List[str] | None = []


    confidence: float | None = None
    #generated response
    draft_response: str | None = None
    final_response: str | None = None
    
    messages: Annotated[List[AnyMessage],add_messages] | None = None