import streamlit as st
from src.ui_utils import init_session, login

page1 = st.Page("pages/home.py", title="🏡 Home")
page2 = st.Page("pages/view_tickets.py", title="🎫 View Tickets")
page3 = st.Page("pages/ticket_details.py", title="🔍 Ticket Details")

pg = st.navigation([
    page1,
    page2,
    page3
])

pg.run()
