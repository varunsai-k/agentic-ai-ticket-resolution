# import streamlit as st
# from PIL import Image
# from src.ui_utils import init_session, login
# import os

# st.set_page_config(
#     page_title="Login",
#     page_icon="🔐",
#     layout="centered"
#     )

# init_session()

# if not st.session_state.logged_in:
# #     st.markdown("""
# #     <style>
# #         section[data-testid="stSidebar"] {
# #             display: none;
# #         }

# #         header[data-testid="stHeader"] {
# #             display: none;
# #         }
# #     </style>
# #     """, unsafe_allow_html=True)
#     login()
#     st.stop()

# st.set_page_config(page_title="Home", page_icon="🏡", layout="wide")

# page1 = st.Page("pages/home.py",title="🏡 Home")
# page2 = st.Page("pages/view_tickets.py", title="🎫 View Tickets")
# page3 = st.Page("pages/ticket_details.py", title="🔍 Ticket Details")

# # Create the navigation structure (this replaces the default)
# # To hide it completely, just don't put it in a sidebar or build the menu
# my_nav = st.navigation([page1, page2, page3])

# # Run the navigation - this hides the default menu if not placed in a sidebar
#      # Or run_with_sidebar() if you want the menu in the sidebar

# my_nav.run()


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