from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from qdrant_client import QdrantClient
import os

def retrieve(query, k=4):
    bi_encoder=GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")
    query_vector = bi_encoder.embed_query(query)
    client_url=os.getenv("QDRANT_CLIENT_URL","http://localhost:6333")
    client = QdrantClient(url=client_url)

    results = client.query_points(
        collection_name="new_collection",
        query=query_vector,
        limit=k,
        with_payload=True
    )

    docs = []
    for point in results.points:
        docs.append(point.payload)

    return docs

