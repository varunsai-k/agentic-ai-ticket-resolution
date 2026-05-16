import streamlit as st
import time
import pandas as pd
from src.ui_utils import  get_tickets_data

st.markdown("""
    <style>
    div.stButton > button {
        background-color: #6366f1;
        color: white;
        border-radius: 8px;
        padding: 6px 12px;
        border: none;
    }
    div.stButton > button:hover {
        background-color: #4f46e5;
        color: white;
    }
    
    section[data-testid="stSidebar"]{
    background:#111827;
    }
    </style>
""", unsafe_allow_html=True)

# 🔒 PROTECT PAGE
if "logged_in" not in st.session_state or not st.session_state.logged_in:
    # st.warning("Please login first")
    # time.sleep(2)
    st.switch_page("pages/home.py")
    #st.rerun()

#st.sidebar.success("Logged in")

# UI
st.set_page_config(page_title="View Tickets",page_icon="🎫",layout="wide")
with st.sidebar:
    st.caption("Made with :material/favorite: by [Varun](https://www.linkedin.com/in/varun-sai-kanuri-089b34226/)")

#st.markdown("### 🎫 View Tickets")
st.title("🎫 View Tickets")
top_left, top_mid, top_right = st.columns([2, 3, 4])

with top_left:
    search = st.text_input("🔍 Search")


# st.write("This is your view tickets section")

STATUS_COLORS = {
    "Resolved": "#22c55e",
    "AI Processing": "#3b82f6",
    "Human Review": "#f59e0b",
    "Manual Handling": "#ef4444",
}

def status_badge(status):
    color = STATUS_COLORS.get(status, "#6b7280")
    return f"""
        <span style="
            background-color:{color};
            color:white;
            padding:4px 10px;
            border-radius:12px;
            font-size:12px;
        ">
            {status}
        </span>
    """

access_token=st.session_state.token
data = get_tickets_data(access_token)
df = pd.DataFrame(data)

with top_right:
    st.markdown("<br>", unsafe_allow_html=True)
    
    status_filter = st.multiselect(
        "Status",
        df["status"].unique(),
        default=df["status"].unique(),
        label_visibility="collapsed"
    )




df = df[df["status"].isin(status_filter)]
if search:
    df = df[df["ticket_id"]==search].reset_index(drop=True)

# st.markdown("### Tickets")
h1, h2, h3, h4 = st.columns([2, 2, 2, 2])

h1.markdown("**Ticket ID**")
h2.markdown("**Query**")
h3.markdown("**Status**")
h4.markdown("**Action**")

# st.markdown("---")


for _, row in df.iterrows():
    col1, col2, col3, col4 = st.columns([2, 2, 2, 2])

    col1.write(row["ticket_id"])
    col2.write(row["title_query"])

    # 🎨 Colored badge
    col3.markdown(status_badge(row["status"]), unsafe_allow_html=True)

    if col4.button("Open", key=row["ticket_id"]):
        st.session_state.selected_ticket = row
        st.switch_page("pages/ticket_details.py")