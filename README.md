## Agentic AI Ticket Resolution System

An enterprise-grade AI-powered ticket resolution platform built using LangGraph, LangChain, FastAPI, and RAG architecture with Human-in-the-Loop governance.

This system automates the end-to-end support ticket lifecycle — from ticket ingestion and intent classification to AI-assisted response generation, approval workflows, and resolution monitoring.



https://github.com/user-attachments/assets/7cdaac32-2109-4873-947b-1413db1bf7c3





## Overview

The Agentic AI Ticket Resolution System is designed to streamline enterprise support operations by combining autonomous AI agents with human oversight.

The platform integrates with ticketing systems through webhook APIs and intelligently processes incoming support requests using multi-agent workflows.

The AI agent:

- Classifies ticket intent and urgency
- Retrieves relevant SOPs and historical tickets using RAG
- Generates contextual AI responses
- Evaluates confidence scores
- Routes low-confidence responses for human approval
- Dynamically resumes execution after approval

<p align="center"><img width="546" height="770" alt="MultiAgentSystem" src="https://github.com/user-attachments/assets/2beb3ce6-0b35-4dab-8507-453b3e228fc8" /></p>

The system also provides an AI Ops dashboard to monitor:

- AI vs Human ticket handling
- Resolution trends
- AI resolution rates
- Operational insights
- Recent ticket activity

## Architecture Overview
<img width="1746" height="746" alt="Agent_incident_architecture" src="https://github.com/user-attachments/assets/85962cef-aec9-4935-a952-64623cdff410" />

**1. Ticket Ingestion Layer**

  Support tickets are raised from ticketing platforms such as:

  - ServiceNow
  - Zendesk
  - Jira
  - Salesforce

  The ticket payload is securely delivered through HTTP POST webhooks to the FastAPI backend.

**2. AI Agent Orchestration Layer**

  The backend triggers the LangGraph workflow which orchestrates multiple AI agents using LangChain.

  Core agent responsibilities include:

  - Intent classification
  - Urgency detection
  - Context retrieval
  - Response drafting
  - Confidence evaluation
  - Human review routing
  - Resolution execution
    
**3. Retrieval & Knowledge Layer**

  The system uses a Qdrant Vector Database for Retrieval-Augmented Generation.

  **Pipeline:**
  SOP Documents → Chunking → Embeddings → Vector Store

  This enables semantic retrieval of:

  **SOPs**
  - Historical resolutions
  - Enterprise knowledge documents
    
**4. Human Approval Workflow**

  If AI confidence falls below a configured threshold:

  - The workflow pauses
  - Ticket is routed for human review
  - Reviewer can edit or approve response
  - Workflow resumes dynamically after approval

  This ensures governance, reliability, and enterprise trust.

**5. Monitoring & Evaluation**

  The platform integrates with LangSmith for:

  - Agent tracing
  - Workflow observability
  - Tool call tracking
  - Execution debugging
  - Performance evaluation

  The AI Ops dashboard provides:

  - AI vs Human handling metrics
  - Resolution analytics
  - Operational insights
  - Ticket monitoring

## Tech Stack

**AI & Orchestration**

  - LangGraph
  - LangChain
  - OpenAI / Gemini / LLM APIs
    
**Backend**

  - FastAPI
  - Python
    
**Frontend**

  - Streamlit
    
**Vector Database**

  - Qdrant
    
**Operational Database**

  - PostgreSQL
    
**Observability**

  - LangSmith

**Deployment**

  - Docker
  - GKE / EKS
  - Cloud Run / ECS
    
**DevOps**

  - CI/CD Pipelines
  - Infrastructure as Code
