import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
from datetime import datetime, timedelta
from streamlit_autorefresh import st_autorefresh
from src.ui_utils import init_session, login, get_tickets_data

st_autorefresh(60 * 1000, key="refresh")

init_session()

if not st.session_state.logged_in:
    st.markdown("""
    <style>
        section[data-testid="stSidebar"]{
            display:none;
        }

        header[data-testid="stHeader"]{
            display:none;
        }
    </style>
    """, unsafe_allow_html=True)
    login()
    st.stop()

else:
    st.set_page_config(page_title="Home",page_icon="🏡",layout="wide")
    st.markdown("""
    <style>

    /* =========================
    KPI METRIC CARDS
    ========================= */

    [data-testid="metric-container"]{

        background:
            linear-gradient(
                145deg,
                rgba(17,24,39,0.95),
                rgba(30,41,59,0.95)
            );

        border: 1px solid rgba(255,255,255,0.06);

        padding: 22px 20px;

        border-radius: 22px;

        box-shadow:
            0 8px 24px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.04);

        position: relative;

        overflow: hidden;

        transition: all 0.25s ease-in-out;
    }


    /* TOP GLOW LINE */

    [data-testid="metric-container"]::before{

        content: "";

        position: absolute;

        top: 0;

        left: 0;

        width: 100%;

        height: 4px;

        background: linear-gradient(
            90deg,
            #7C73FF,
            #60A5FA,
            #34D399
        );
    }


    /* SIDE GLOW */

    [data-testid="metric-container"]::after{

        content: "";

        position: absolute;

        right: -40px;

        top: -40px;

        width: 120px;

        height: 120px;

        background: rgba(124,115,255,0.12);

        border-radius: 50%;

        filter: blur(35px);
    }


    /* HOVER EFFECT */

    [data-testid="metric-container"]:hover{

        transform: translateY(-5px);

        border: 1px solid rgba(124,115,255,0.35);

        box-shadow:
            0 14px 32px rgba(124,115,255,0.18),
            0 0 16px rgba(96,165,250,0.10);
    }


    /* KPI LABEL */

    [data-testid="metric-container"] label{

        color: #94A3B8 !important;

        font-size: 13px !important;

        font-weight: 600 !important;

        letter-spacing: 0.5px;

        text-transform: uppercase;
    }


    /* KPI VALUE */

    [data-testid="metric-container"] [data-testid="stMetricValue"]{

        color: white;

        font-size: 36px;

        font-weight: 700;

        line-height: 1.2;
    }


    /* KPI DELTA */

    [data-testid="stMetricDelta"]{

        font-size: 14px;

        font-weight: 600;
    }


    /* COLUMN SPACING */

    div[data-testid="column"]{

        padding-top: 5px;
    }

    </style>
    """, unsafe_allow_html=True)
    

    st.markdown("""
        <style>
                
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

            section[data-testid="stSidebar"]{
                background:#111827;
            };
            
                
        </style>
        """, unsafe_allow_html=True)

    with st.sidebar:
        
        st.caption("Made with :material/favorite: by [Varun](https://www.linkedin.com/in/varun-sai-kanuri-089b34226/)")
        if st.button("Logout"):
            st.session_state.logged_in = False
            st.rerun()
    token=st.session_state.token
    data=get_tickets_data(token)
    df=pd.DataFrame(data)
    total=len(df)
    #st.dataframe(df.head(5),use_container_width=True)
    resolved=len(df[df["status"]=="Resolved"])
    ai_processing=len(df[df["status"]=="AI Processing"])
    needs_review=len(df[df["status"]=="Human Review"])
    manual=len(df[df["status"]=="Manual Handling"])
    today=datetime.now().date()
    yesterday=today-timedelta(days=1)
    df["created_at"] = pd.to_datetime(df["created_at"])
    today_count=len(df[df["created_at"].dt.date==today])
    yesterday_count=len(df[df["created_at"].dt.date==yesterday])

    delta_total=today_count-yesterday_count

    st.title("AI Ticket Ops Dashboard")
    st.markdown("Monitor AI vs Human ticket handling in real-time")
    # st.switch_page("pages/Dashboard.py")
    # 🎨 KPI CARD STYLING
    st.markdown("""
    <style>

    /* =========================
    KPI CARD CONTAINER
    ========================= */

    div[data-testid="stMetric"]{

        background: linear-gradient(
            145deg,
            #111827,
            #172033
        );

        border: 1px solid rgba(255,255,255,0.06);

        padding: 22px 24px;

        border-radius: 22px;

        height: 180px;   /* SAME HEIGHT */

        display: flex;

        flex-direction: column;

        justify-content: center;

        box-shadow:
            0 8px 24px rgba(0,0,0,0.35);

        position: relative;

        overflow: hidden;

        transition: all 0.25s ease;
    }


    /* TOP GLOW LINE */

    div[data-testid="stMetric"]::before{

        content: "";

        position: absolute;

        top: 0;

        left: 0;

        width: 100%;

        height: 4px;

        background: linear-gradient(
            90deg,
            #7C73FF,
            #60A5FA,
            #34D399
        );
    }


    /* LIGHT GLOW */

    div[data-testid="stMetric"]::after{

        content: "";

        position: absolute;

        top: -40px;

        right: -40px;

        width: 120px;

        height: 120px;

        background: rgba(124,115,255,0.12);

        border-radius: 50%;

        filter: blur(35px);
    }


    /* HOVER EFFECT */

    div[data-testid="stMetric"]:hover{

        transform: translateY(-5px);

        border: 1px solid rgba(124,115,255,0.35);

        box-shadow:
            0 14px 34px rgba(124,115,255,0.18);
    }


    /* LABEL */

    div[data-testid="stMetricLabel"]{

        color: #9CA3AF !important;

        font-size: 14px !important;

        font-weight: 600 !important;

        letter-spacing: 0.4px;

        margin-bottom: 12px;
    }


    /* VALUE */

    div[data-testid="stMetricValue"]{

        color: white !important;

        font-size: 48px !important;

        font-weight: 700 !important;

        line-height: 1;
    }


    /* DELTA */

    div[data-testid="stMetricDelta"]{

        margin-top: 14px;

        font-size: 16px !important;

        font-weight: 600 !important;
    }


    /* REMOVE EXTRA SPACE */

    div[data-testid="column"]{

        padding-top: 5px;
    }


    /* MAKE CARDS FEEL PREMIUM */

    div[data-testid="stMetric"] label p{

        font-size: 15px !important;
    }

    </style>
    """, unsafe_allow_html=True)

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Total Tickets", total, f"{delta_total:+} today")
    col2.metric("Resolved ✅", resolved)
    col3.metric("🤖 AI Processing", ai_processing)
    col4.metric("Needs Attention ⚠️",needs_review+manual)
    st.markdown("---")

    col_left, col_right = st.columns(2)
    with col_left:
        st.subheader("Ticket Distribution")

        fig=px.pie(
            df,
            names="status",
            color_discrete_sequence=px.colors.sequential.Rainbow, #color_discrete_sequence=['#feb236','#b2b2b2','#ffef96']
            hole=.7
        )
        #fig.update_layout(legend=dict(orientation='h',yanchor='bottom',y=1.02,xanchor='right',x=1))

        st.plotly_chart(fig, use_container_width=True)

    with col_right:
        st.subheader("Recent Tickets")
        st.write("\n\n\n\n")
        df_sorted=df.sort_values(by="created_at", ascending=False).reset_index(drop=True)
        st.dataframe(df_sorted.head(10), use_container_width=True)
    handling_df = pd.DataFrame({
        "Type": ["AI Handled", "Human Involved"],
        "Count": [
            resolved + ai_processing,
            needs_review + manual
        ]
    })

    ai_human_handling_split_fig = px.bar(
        handling_df,
        x="Type",
        y="Count",
        color="Type",
        text_auto=True,
        color_discrete_sequence=px.colors.sequential.Rainbow
    )

    funnel_df = pd.DataFrame({
    "Stage": [
        "Total Tickets",
        "AI Processing",
        "Needs Review",
        "Resolved"
    ],
    "Count": [
        total,
        ai_processing,
        needs_review,
        resolved
    ]
    })


    funnel_fig = px.funnel_area(
                    funnel_df,
                    values="Count",
                    names="Stage",
                    color_discrete_sequence=px.colors.sequential.Rainbow
                )
    # funnel_fig = px.funnel(
    #     funnel_df,
    #     x="Count",
    #     y="Stage",
    #     color_discrete_sequence=px.colors.sequential.Rainbow
    # )
    success_rate= (resolved/total)*100
    gauge_fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=success_rate,
        title={'text': "Resolution Rate"},
        gauge={'axis': {'range': [0, 100]}}
    ))

    #st.plotly_chart(fig, use_container_width=True)
    
    st.markdown("---")
    st.subheader("Ticket Trends")

    df["date"]=df["created_at"].dt.date
    trend_df=df.groupby(["date","status"]).size().reset_index(name="count")

    fig = px.line(
        trend_df,
        x="date",
        y="count",
        color="status",
        markers=True,
        color_discrete_sequence=px.colors.sequential.Rainbow #Plasma, Rainbow
    )

    st.plotly_chart(fig, use_container_width=True)
    st.markdown("---")
    fig1, fig2, fig3 = st.columns(3)
    with fig1:
        st.subheader("AI Vs Human Split")
        st.plotly_chart(ai_human_handling_split_fig, use_container_width=True)
    with fig2:
        st.subheader("Ticket Status Funnel")
        st.plotly_chart(funnel_fig, use_container_width=True)
    with fig3:
        st.subheader("Resolution Rate Gauge")
        st.plotly_chart(gauge_fig, use_container_width=True)

    st.markdown("---")
    st.markdown("""<h4>
                        AI Insights
                    </h4>
                """,
                unsafe_allow_html=True)
    

    col1, col2 = st.columns(2)
    with col1:
        st.warning("⚠️ High number of tickets requires human review")
        st.info("🤖 AI is handling majority of tickets efficiently")
        # if needs_review > resolved:
        #     st.warning("⚠️ High number of tickets requires human review")
        # if ai_processing > total * 0.5:
        #     st.info("🤖 AI is handling majority of tickets efficiently")
    with col2:
        critical=manual
        st.error(f"🔥 {critical} tickets require full manual handling")
        success_rate= (resolved/total)*100

        st.success(f"✅ Resolution Rate: {success_rate:.1f}%")
    
