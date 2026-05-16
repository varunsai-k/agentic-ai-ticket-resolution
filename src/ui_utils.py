import requests
from fastapi import Body, Form, HTTPException
import streamlit as st
import pandas as pd
import time

def init_session():

    if "logged_in" not in st.session_state:
        st.session_state.logged_in=False

def login():
    st.set_page_config(
        page_title="AI Ticket Ops",
        page_icon="🎫",
        layout="wide"
    )

    st.markdown("""
    <style>
    .main-title{
        text-align:center;
        font-size:42px;
        font-weight:700;
        color:#6C63FF;
        margin-bottom:10px;
    }

    .signin-text{
        text-align:center;
        color:#555;
        margin-bottom:20px;
        font-size:20px;
        font-weight:600;
    }

    .stTextInput > div > div > input{
        border-radius:10px;
        padding:12px;
    }

    .login-box{
        max-width:450px;
        margin:auto;
        margin-top:40px;
    }

    .stButton button{
        background:linear-gradient(90deg,#6C63FF,#8E7CFF);
        color:white;
        border:none;
        border-radius:10px;
        height:45px;
        font-size:16px;
        font-weight:600;
    }

    .stButton button:hover{
        background:linear-gradient(90deg,#5A52E0,#7A6BFF);
        color:white;
    }
    </style>
    """, unsafe_allow_html=True)

    st.markdown('<div class="main-title">🎫 AI Ticket Ops</div>', unsafe_allow_html=True)
    st.markdown('<div class="signin-text">Sign in</div>', unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1.2, 1, 1.2])

    with col2:

        with st.container(border=True):

            username = st.text_input(
                "Username",
                placeholder="Enter username"
            )

            password = st.text_input(
                "Password",
                type="password",
                placeholder="Enter password"
            )

            login_btn = st.button(
                "Login",
                use_container_width=True
            )

            if login_btn:

                with st.spinner("Authenticating..."):

                    response = requests.post(
                        "http://localhost:8000/auth/login",
                        data={
                            "username": username,
                            "password": password
                        }
                    )

                    try:

                        token = response.json()["access_token"]

                        st.session_state.logged_in = True
                        st.session_state.token = token

                        st.switch_page("pages/home.py")

                    except Exception as e:
                        #st.write(e)
                        st.error("Invalid credentials")

def loginimp():
    st.set_page_config(
        page_title="AI Ticket Ops",
        page_icon="🎫",
        layout="wide"
    )

    st.title("🎫 AI Ticket Ops")

    st.markdown("### Sign in")

    with st.container(border=True):

        username = st.text_input(
            "Username",
            placeholder="Enter username"
        )

        password = st.text_input(
            "Password",
            type="password",
            placeholder="Enter password"
        )

        col1, col2, col3 = st.columns([1,2,1])

        with col2:

            login_btn = st.button(
                "Login",
                use_container_width=True
            )

        if login_btn:

            with st.spinner("Authenticating..."):

                response = requests.post(
                    "http://localhost:8000/auth/login",
                    data={
                        "username": username,
                        "password": password
                    }
                )

                try:

                    token = response.json()["access_token"]

                    st.session_state.logged_in = True
                    st.session_state.token = token
                    #st.rerun()
                    st.switch_page("pages/home.py")

                except Exception as e:
                    #st.write(e)
                    st.error("Invalid credentials")

def login2():
    st.set_page_config(
    page_title="AI Ticket Ops",
    page_icon="🎫",
    layout="wide",
    initial_sidebar_state="collapsed"
    )
    

    # ---------- CUSTOM CSS ----------
    st.markdown("""
    <style>

        /* Main background */
        .stApp {
            background: linear-gradient(135deg, #0f172a, #111827);
        }

        /* Remove default padding */
        .block-container {
            padding-top: 4rem;
        }

        /* Login Card */
        .login-card {
            background: rgba(17, 24, 39, 0.75);
            padding: 10px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(14px);
            box-shadow: 0px 10px 30px rgba(0,0,0,0.35);
            max-width: 350px;
            margin: auto;
        }

        /* Title */
        .title {
            text-align: center;
            color: white;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        /* Subtitle */
        .subtitle {
            text-align: center;
            color: #9ca3af;
            font-size: 15px;
            margin-top: 10px;
            margin-bottom: 35px;
        }

        /* Input fields */
        div[data-baseweb="input"] {
            background-color: rgba(255,255,255,0.04) !important;
            border-radius: 14px !important;
            border: 1px solid rgba(255,255,255,0.08);
            padding: 6px;
        }

        input {
            color: white !important;
            font-size: 15px !important;
        }

        input::placeholder {
            color: #9ca3af !important;
        }

        /* Login button */
        .stButton > button {
            width: 100%;
            height: 50px;
            border-radius: 14px;
            border: none;
            background: linear-gradient(90deg, #2563eb, #7c3aed);
            color: white;
            font-size: 16px;
            font-weight: 600;
            transition: 0.3s ease;
            margin-top: 10px;
        }

        .stButton > button:hover {
            transform: translateY(-2px);
            box-shadow: 0px 8px 20px rgba(37,99,235,0.35);
        }

        /* Labels */
        label {
            color: #d1d5db !important;
            font-weight: 500 !important;
        }

    </style>
    """, unsafe_allow_html=True)

    # ---------- LOGIN UI ----------
    st.markdown("""
    <div class="login-card">
                <div class="title">AI Ticket Ops</div>
    </div>
                """, unsafe_allow_html=True)
    
    st.markdown("""
        <div class="subtitle">
            Sign in to continue to your AI Dashboard
        </div>""", unsafe_allow_html=True)
    

    # Form container
    with st.container():

        username = st.text_input(
            "Username",
            placeholder="Enter your username"
        )

        password = st.text_input(
            "Password",
            type="password",
            placeholder="Enter your password"
        )

        if st.button("Login"):

            with st.spinner("Authenticating..."):

                response = requests.post(
                    "http://localhost:8000/auth/login",
                    data={
                        "username": username,
                        "password": password
                    }
                )

                try:
                    token = response.json()["access_token"]

                    st.session_state.logged_in = True
                    st.session_state.token = token

                    st.success("Logged in Successfully!")
                    st.rerun()

                except Exception as e:
                    st.write(e)
                    st.error("Invalid Credentials")

def login_1():

    st.title("Login")

    username=st.text_input("Username")
    password=st.text_input("Password", type="password")

    if st.button("Login"):

        response = requests.post(
            "http://localhost:8000/auth/login",
            data={
                "username": username,
                "password": password
            }
        )

        try:

            token = response.json()["access_token"]
            st.session_state.logged_in=True
            st.session_state.token=token
            st.success("Logged in Successfully!")
            st.rerun()

        except Exception as e:
            #st.write(e)
            st.error("Invalid Credentials")

def get_tickets_data(token):

    headers = {
    "Authorization": f"Bearer {token}"
    }

    response = requests.get(
        "http://localhost:8000/tickets",
        headers=headers
    )

    return response.json()

def edit_response(token, ticket_id, final_response, userid, username):

    headers = {
    "Authorization": f"Bearer {token}"
    }
    
   
    response= requests.get(
    "http://localhost:8000/threads/thread",
    params={"ticket_id": ticket_id},
    headers=headers)
    
    thread_=response.json()

    thread_id=thread_["thread_id"]

    response = requests.post(
    "http://localhost:8000/agent/resume",

    json={
        "thread_id": thread_id,
        "final_response": final_response,
        "ticket_id": ticket_id,
        "user_id": userid,
        "username": username,
        "token": token
    },
    headers=headers
    )

    # return response.json()

def get_resolved_ticket_details(row):
    data={
           "ticket_id" : row["ticket_id"],

            "user_id" : row["user_id"],
            "username" : row["username"],

            "category" : row["category"],
            "title_query" : row["title_query"],
            "ticket_description" : row["ticket_description"],

            "status" : row["status"],
            "created_at" : row["created_at"],

            "intent" : row["intent"],

            "priority" : row["priority"],

            "ai_response" : row["ai_response"],
            "ai_confidence" : row["ai_confidence"],
            "retrieved_documents" : row["retrieved_documents"],

            "final_response" : row["final_response"],

            "resolution_state" : row["resolution_state"],

            "resolved_by" : row["resolved_by"]
        }
    df=pd.DataFrame(data.items(), columns=["Key","Value"])
    return df