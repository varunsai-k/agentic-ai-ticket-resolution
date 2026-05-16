from src.state import IncidentClassification, IncidentState, UserContext
from langgraph.runtime import Runtime
from src.llms import Incident_classifier, llm
import random
from langgraph.types import Command, Interrupt, interrupt
from typing import List, Literal, Union, Annotated
from datetime import datetime, timedelta
from src.prompts import RAG_response_generation_prompt, Incident_classification_prompt
import requests
from src.retrieval import retrieve

# Creating Graph Nodes and routers

def classify_incident(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:
    print(state)
    state.classification = Incident_classifier.invoke(state.incident_title)
    #state.classification = IncidentClassification(category='Product', intent='Feature Request', urgency='High')
    return state

def router(state: IncidentState, runtime: Runtime[UserContext]) -> Literal["human_eval","doc_search"]:
    classifier_op=state.classification
    if classifier_op.urgency in ["High","Critical"]:
        return "human_eval"
    else:
        return "doc_search"

def human_eval(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:

    url = "http://127.0.0.1:8000/tickets/update/human_eval"
    userid=runtime.context.userid
    username=runtime.context.username
    payload = {
        "ticket_id": state.incident_id,
        "user_id": userid,
        "username": username,
        "category": state.classification.category,
        "title_query": state.incident_title,
        "ticket_description": state.incident_description,
        "status": "Manual Handling",
        "created_at": datetime.now().isoformat(),
        "intent": state.classification.intent,
        "priority": state.classification.urgency,
        "resolution_state": "In Progress",
        "resolved_by":"Human"
        
    }
    token = runtime.context.access_token
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(
        url,
        json=payload,
        headers=headers
    )
    print(response.json())
    print(f"updated database as human evaluation for the incident {state.incident_id}")
    state.status="Manual Handling"
    return state

def doc_search(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:

    
    retrieval_format="""Query: {},
    Answer: {},
    """

    query=state.incident_title
    docs = retrieve(query) ## to get history incidents and relavant docs
    content=[ retrieval_format.format(page.get("page_content"), page.get("metadata")["answer"]) for page in docs]
    # docs=["doc1", "doc2", "doc3","doc4"]
    # content=docs
    state.relevant_docs=content
    state.history_incidents=[page.get("page_content") for page in docs]
    #state.history_incidents=[page for page in docs]
    return state

def draft_response(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:
    # node to create draft response
    prompt = RAG_response_generation_prompt.format(
        query=state.incident_title,
        retrieved_context=state.relevant_docs
    )
    result=llm.invoke(prompt)
    response=result.content
    #response="I resolved this issue.."
    state.draft_response=response
    return state

def evaluator(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:
    confidence_score=random.choice([60.0,65.0,75.0])
    state.confidence=confidence_score
    return state

def human_router(state: IncidentState, runtime: Runtime[UserContext]) -> Literal["send_response","human_review"]:
    # LLM evaluates the draft response to calculate the confidence score
    
    confidence_score=state.confidence
    if confidence_score > 75:
        return "send_response"
    else:
        return "human_review"

def human_review(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:
    # updates the database and return state
    url = "http://127.0.0.1:8000/tickets/update/human_review"
    userid=runtime.context.userid
    username=runtime.context.username
    payload = {
        "ticket_id": state.incident_id,
        "user_id": userid,
        "username": username,
        "category": state.classification.category,
        "title_query": state.incident_title,
        "ticket_description": state.incident_description,
        "status": "Human Review",
        "created_at": datetime.now().isoformat(),
        "intent": state.classification.intent,
        "priority": state.classification.urgency,
        "resolution_state": "Needs Review",
        "ai_response":state.draft_response,
        "ai_confidence": state.confidence,
        "retrieved_documents": state.history_incidents
        
    }
    
    token = runtime.context.access_token
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(
        url,
        json=payload,
        headers=headers
    )

    print(response.json())
    print(f"updated database as human evaluation for the incident {state.incident_id}")
    state.status="Human Review"
    return state

def approval_node(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:
    approved = interrupt(
        {
            "question": "Approve draft?",
            "draft": state.draft_response
        }
    )

    state.final_response=approved
    return state

def send_approved_response(state: IncidentState, runtime: Runtime[UserContext]) -> IncidentState:
    # updates the database and return state
    url = "http://127.0.0.1:8000/tickets/update/approved_response"
    userid=runtime.context.userid
    username=runtime.context.username
    payload = {
        "ticket_id": state.incident_id,
        
        "status": "Resolved",
        "resolution_state": "Needs Review",
        "final_response": state.final_response,
        "resolved_by":"AI+Human"
        
    }
    
    token = runtime.context.access_token
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.patch(
        url,
        json=payload,
        headers=headers
    )

    print(response.json())
    print(f"updated database as human evaluation for the incident {state.incident_id}")
    state.status="AI+Human"
    return state


def send_response(state: IncidentState,  runtime: Runtime[UserContext]) -> IncidentState:
    #sends response
    url = "http://127.0.0.1:8000/tickets/update/auto_resolve"
    userid=runtime.context.userid
    username=runtime.context.username
    print(state)
    payload = {
        "ticket_id": state.incident_id,
        "user_id": userid,
        "username": username,
        "category": state.classification.category,
        "title_query": state.incident_title,
        "ticket_description": state.incident_description,
        "status": "Resolved",
        "created_at": datetime.now().isoformat(),
        "intent": state.classification.intent,
        "priority": state.classification.urgency,
        "resolution_state": "Closed",
        "ai_response":state.draft_response,
        "ai_confidence": state.confidence,
        "retrieved_documents": state.history_incidents,
        "final_response":state.draft_response,
        "resolved_by":"AI"
        
    }
    
    token = runtime.context.access_token
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.post(
        url,
        json=payload,
        headers=headers
    )

    print(response.json())
    print(f"updated database as human evaluation for the incident {state.incident_id}")
    state.status="Resolved"
    return state

