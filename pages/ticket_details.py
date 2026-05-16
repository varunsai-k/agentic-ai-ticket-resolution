import streamlit as st
import difflib
from src.ui_utils import get_resolved_ticket_details, edit_response


if not st.session_state.get("logged_in"):
    st.switch_page("pages/home.py")
    #st.rerun()


st.markdown("""
<style>

.chat-wrapper{
    display:flex;
    flex-direction:column;
    gap:18px;
    margin-top:10px;
    margin-bottom:20px;
}

.chat-row{
    display:flex;
    width:100%;
}

.chat-user{
    margin-left:auto;
    background:#2563eb;
    color:white;
    padding:14px 16px;
    border-radius:18px 18px 4px 18px;
    max-width:75%;
    font-size:15px;
    line-height:1.5;
    box-shadow:0 2px 8px rgba(0,0,0,0.08);
}

.chat-ai{
    margin-right:auto;
    background:#f3f4f6;
    color:#111827;
    padding:14px 16px;
    border-radius:18px 18px 18px 4px;
    max-width:75%;
    font-size:15px;
    line-height:1.5;
    border:1px solid #e5e7eb;
}

.chat-label{
    font-size:12px;
    font-weight:600;
    margin-bottom:6px;
    opacity:0.8;
}

.section-card{
    background:white;
    padding:20px;
    border-radius:18px;
    border:1px solid #e5e7eb;
    margin-bottom:18px;
}

.timeline-item{
    padding:10px 14px;
    border-left:3px solid #2563eb;
    margin-bottom:10px;
    background:#f9fafb;
    border-radius:8px;
}

</style>
""", unsafe_allow_html=True)

st.markdown("""
<style>

.chat-user {
    background: #2563eb;
    color: white;
    padding: 14px 16px;
    border-radius: 18px 18px 4px 18px;
    margin-left: auto;
    width: fit-content;
    max-width: 75%;
    margin-bottom: 16px;
}

.chat-ai {
    background: #f3f4f6;
    color: black;
    padding: 14px 16px;
    border-radius: 18px 18px 18px 4px;
    width: fit-content;
    max-width: 75%;
    margin-bottom: 16px;
    border: 1px solid #e5e7eb;
}

.chat-label {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 6px;
}

</style>
""", unsafe_allow_html=True)

st.markdown("""
<style>

.section-card{
    background:#c39ee8;
    padding:15px;
    border-radius:10px;
    border:1px solid #c39ee8;
    margin-bottom:16px;
    line-height:1.6;
    color: #401869;
}

.timeline-item{
    background:#9deb9d;
    border-left:5px solid #e988f2;
    padding:5px 8px;
    border-radius:10px;
    margin-bottom:12px;
    font-size:14px;
    color: #0f0f0f;
}
            
.retrieved-item{
    background:#9deb9d;
    border-left:5px solid #e988f2;
    padding:5px 8px;
    border-radius:10px;
    margin-bottom:12px;
    font-size:14px;
    color: #0f0f0f;
            
    
}
section[data-testid="stSidebar"]{
    background:#111827;
}
            
.timeline-item{
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.06);
    border-left: 4px solid #8b5cf6;
    padding: 14px 16px;
    border-radius: 12px;
    margin-bottom: 14px;
    font-size: 15px;
    color: #f1f5f9;
    transition: all 0.2s ease;
}

/* HOVER EFFECT */
.timeline-item:hover{
    transform: translateY(-2px);
    background: #243041;
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}

/* RETRIEVED DOCS */
.retrieved-item{
    background: #1e293b;
    border: 1px solid rgba(255,255,255,0.06);
    border-left: 4px solid #06b6d4;
    padding: 14px 16px;
    border-radius: 12px;
    margin-bottom: 14px;
    font-size: 15px;
    color: #f1f5f9;
    transition: all 0.2s ease;
}

.retrieved-item:hover{
    transform: translateY(-2px);
    background: #243041;
    box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}

/* OPTIONAL SUBTEXT */
.muted-text{
    color:#94a3b8;
    font-size:13px;
}


</style>
""", unsafe_allow_html=True)



st.set_page_config(page_title="Ticket Details",page_icon="🔍",layout="wide")
with st.sidebar:
    st.caption("Made with :material/favorite: by [Varun](https://www.linkedin.com/in/varun-sai-kanuri-089b34226/)")
    



ticket=st.session_state.get("selected_ticket", None)
if ticket is None:
    st.warning("Please Select ticket to view more details")
    st.stop()

top_left, top_right = st.columns([6, 2])

with top_left:
    st.markdown(f"## 🔍 Ticket {ticket['ticket_id']}")

with top_right:
    st.warning(ticket["status"])



def show_human_review_ui(ticket):

    data=get_resolved_ticket_details(ticket)
    st.subheader("🎫 Ticket Details")
    st.dataframe(data, use_container_width=True, hide_index=True, height=200)

    st.write("")

    with st.expander("💬 Conversation"):
        st.markdown(
            f"""
        <div class="chat-user">
            <div class="chat-label">👤 User</div>
            {ticket['title_query']}
        </div>
        """,
            unsafe_allow_html=True
        )

        st.markdown(
            f"""
        <div class="chat-ai">
            <div class="chat-label">🤖 AI Assistant</div>
            {ticket['ai_response']}
        </div>
        """,
            unsafe_allow_html=True
        )

    st.write("")
    with st.expander("📄 Knowledge Source"):
        col1, col2, col3 = st.columns(3)
        with col1:
            
            retriever_docs=ticket["retrieved_documents"]
            for step in retriever_docs:
                st.markdown(
                    f"<div class='retrieved-item'>📗{step}</div>",
                    unsafe_allow_html=True
                )
    st.write("")
    col1, col2, col3 = st.columns(3)
    with col1:

        st.markdown("### 🤖 AI Confidence")

        confidence = ticket["ai_confidence"]

        st.progress(int(confidence))
        st.caption(f"{int(confidence)}% confidence")

    st.divider()

    st.subheader("✏️ Review Response")

    edited_response = st.text_area(
        "Edit Response",
        value=ticket["ai_response"],
        height=180,
        label_visibility="collapsed"
    )

    if edited_response != ticket["ai_response"]:

        st.markdown("#### 🔍 Changes")
        diff = difflib.ndiff(
        ticket["ai_response"].split(),
        edited_response.split()
        )

        diff_html = ""
        for word in diff:
            if word.startswith("- "):
                diff_html += f"<span style='color:red;text-decoration:line-through'>{word[2:]} </span>"
            elif word.startswith("+ "):
                diff_html += f"<span style='color:green'>{word[2:]} </span>"
            else:
                diff_html += f"{word[2:]} "

        st.markdown(diff_html, unsafe_allow_html=True)

        
    token, ticket_id = st.session_state.token, ticket["ticket_id"]
    col1, col2 = st.columns([1,1])
    userid, username = ticket["user_id"], ticket["username"]
    with col1:
        if st.button("✏️ Edit & Approve", use_container_width=True):
            final_response=edited_response
            edit_response(token, ticket_id, final_response, userid, username)

            st.success("Edited response Approved!")

    with col2:
        if st.button(
            "✅ Approve",
            type="primary",
            use_container_width=True):
            final_response=edited_response
            st.write(ticket_id)
            edit_response(token, ticket_id, final_response, userid, username)
            st.success("Approved Instanly!")



def show_resolved_ui(ticket):

    st.success("✅ Ticket Successfully Resolved")
    
    data=get_resolved_ticket_details(ticket)
    
    st.subheader("🎫 Ticket Details")
    st.dataframe(data, use_container_width=True, hide_index=True, height=200)

    st.subheader("🧾 User Query")

    st.info(ticket["title_query"])

    st.subheader("📩 Final Response")

    
    
    st.markdown(f"""
    <div class="section-card">
        {ticket.get("final_response", ticket["ai_response"])}
    </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns(2)

    with col1:
        st.metric("Resolved By", ticket.get("resolved_by", "AI"))

    with col2:
        resolved_at=ticket.get("created_at", "10:32 AM")
        if type(resolved_at)!=str and resolved_at is not None:
            resolved_at=resolved_at.strftime("%Y-%m-%d %H:%M:%S")
        st.metric("Resolved At", resolved_at or "10:32 AM")

    


    

    timeline = [
        "Ticket Created",
        "AI Generated Response",
        "Sent to User",
        "Marked Resolved"
    ]
    col1, col2, col3 = st.columns(3)
    with col1:
        st.subheader("🕒 Timeline")
        for step in timeline:
            st.markdown(
                f"<div class='timeline-item'>✔ {step}</div>",
                unsafe_allow_html=True
            )
    with col3:
        if ticket["resolved_by"] in ["AI", "AI+Human"]:
            st.subheader("📄 Knowledge Source")
            retriever_docs=ticket["retrieved_documents"]
            for step in retriever_docs:
                st.markdown(
                    f"<div class='retrieved-item'>📗{step}</div>",
                    unsafe_allow_html=True
                )
        else:
            pass



def show_processing_ui(ticket):

    #st.warning("🤖 AI is currently processing this ticket")
    st.markdown(f"""
    <div class="section-card">
        🤖 AI is currently processing this ticket
    </div>
    """, unsafe_allow_html=True)

    data=get_resolved_ticket_details(ticket)
    st.subheader("🎫 Ticket Details")
    st.dataframe(data, use_container_width=True, hide_index=True, height=200)

    st.subheader("🧾 Ticket Query")

    st.info(ticket["title_query"])

    st.subheader("⚙️ Processing Status")

    progress = 70

    st.progress(progress / 100)

    st.caption(f"{progress}% completed")

    steps = [
        "✔ Intent Classified",
        "✔ Retrieved Knowledge Base",
        "⏳ Generating Response",
        "⬜ Waiting for Completion"
    ]
    col1, col2, col3 = st.columns(3)
    with col1:
        for step in steps:
            st.markdown(
                f"<div class='timeline-item'>{step}</div>",
                unsafe_allow_html=True
            )


def show_manual_ui(ticket):

    data=get_resolved_ticket_details(ticket)

    st.error("🔥 Escalated for Manual Handling")
    st.subheader("🎫 Ticket Details")
    st.dataframe(data, use_container_width=True, hide_index=True, height=200)

    sec1, sec2 = st.columns(2)
    with sec1:
        st.subheader("🧾 Ticket Query")

        st.info(ticket["title_query"])

    with sec2:
        st.subheader("⚠ Escalation Reason")

        st.warning(
            
                "Escalated to Human Evaluation because the ticket priority is High."
        )
    #st.markdown("---")
    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Urgency", ticket.get("priority", "Critical"))

    with col2:
        st.metric("Assigned Agent", ticket.get("resolved_by", "Sai"))

    with col3:
        st.metric("SLA Remaining","15 mins")

    

    

    timeline = [
        "Ticket Created",
        "AI Agent checked the urgency",
        "Urgency is High",
        "Escalated to Human"
    ]
    col1, col2, col3 = st.columns(3)
    with col1:
        st.subheader("🕒 Timeline")
        for step in timeline:
            st.markdown(
                f"<div class='timeline-item'>✔ {step}</div>",
                unsafe_allow_html=True
            )
    

# ----------------------------
# Dynamic UI based on status
# ----------------------------
if ticket["status"] == "Human Review":
    show_human_review_ui(ticket)

elif ticket["status"] == "Resolved":
    show_resolved_ui(ticket)

elif ticket["status"] == "AI Processing":
    show_processing_ui(ticket)

elif ticket["status"] == "Manual Handling":
    show_manual_ui(ticket)

# ----------------------------
# Back Button
# ----------------------------
st.markdown("<br>", unsafe_allow_html=True)

if st.button("⬅️ Back to Tickets"):
    st.switch_page("pages/view_tickets.py")