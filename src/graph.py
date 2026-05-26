from langgraph.types import RetryPolicy
from langgraph.checkpoint.postgres import PostgresSaver
import os
import psycopg
from langgraph.graph import START, END, StateGraph, add_messages
from src.state import IncidentState, UserContext
from src.nodes import classify_incident, human_eval, human_review, human_router, doc_search, router
from src.nodes import draft_response, evaluator, send_response, send_approved_response, approval_node



graph=StateGraph(IncidentState, context_schema=UserContext)

graph.add_node("classify_incident",classify_incident)
graph.add_node("human_eval",human_eval)
graph.add_node("doc_search",doc_search, retry_policy=RetryPolicy(max_attempts=2))
graph.add_node("draft_response",draft_response)
graph.add_node("evaluator", evaluator)
graph.add_node("send_response",send_response)
graph.add_node("human_review",human_review)
graph.add_node("approval_node",approval_node)
graph.add_node("send_approved_response",send_approved_response)


graph.add_edge(START, "classify_incident")
graph.add_conditional_edges("classify_incident",router,["human_eval","doc_search"])
graph.add_edge("human_eval",END)
graph.add_edge("doc_search","draft_response")
graph.add_edge("draft_response","evaluator")

graph.add_conditional_edges("evaluator",human_router,["send_response","human_review"])
graph.add_edge("send_response",END)
graph.add_edge("human_review", "approval_node")
graph.add_edge("approval_node", "send_approved_response")
graph.add_edge("send_approved_response", END)

IS_LANGGRAPH = os.getenv("LANGGRAPH_API", "false").lower() == "true"
if IS_LANGGRAPH:
    agent = graph.compile()
else:
    DB_URI=os.getenv("DB_URI","postgresql://postgres:pwd@localhost:5432/langgraph")

    conn = psycopg.connect(DB_URI, autocommit=True)

    checkpointer = PostgresSaver(conn)

    checkpointer.setup()

    agent=graph.compile(checkpointer=checkpointer)
