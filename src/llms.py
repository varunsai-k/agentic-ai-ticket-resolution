from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from src.state import IncidentClassification

load_dotenv()

gemini_llm=ChatGoogleGenerativeAI(model="gemini-2.5-flash")
llm=ChatGroq(model="llama-3.1-8b-instant")

Incident_classifier=llm.with_structured_output(IncidentClassification)
