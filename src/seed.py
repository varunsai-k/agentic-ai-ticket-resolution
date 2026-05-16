from src.models.Users import User
from src.models.Tickets import Ticket
from src.models.Threads import Thread
from passlib.context import CryptContext
from datetime import datetime, timedelta, UTC
import random

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def seed_users(db):

    users = [
        User(
            user_id="USR001",
            username="sai",
            fullname="Sai Kanuri",
            email="sai@mail.com",
            password_hash=pwd_context.hash("sai123"),
            mobile_number="9876543210"
        ),

        User(
            user_id="USR002",
            username="ramya",
            fullname="Ramya",
            email="ramya@mail.com",
            password_hash=pwd_context.hash("ramya123"),
            mobile_number="9876543211"
        ),

        User(
            user_id="USR003",
            username="sandy",
            fullname="Sandy",
            email="sandy@mail.com",
            password_hash=pwd_context.hash("sandy123"),
            mobile_number="9876543212"
        )
    ]

    try:
        db.add_all(users)
        db.commit()

        print("Users inserted")

    finally:
        db.close()

def seed_tickets(db):


    users = [
        ("USR001", "sai"),
        ("USR002", "ramya"),
        ("USR003", "sandy"),
    ]

    categories = [
        ("Refund", "Refund Request"),
        ("Billing", "Billing Issue"),
        ("Technical", "Technical Support"),
        ("Order", "Order Issue"),
        ("Login", "Login Issue"),
    ]

    sample_documents = [
        "Password reset troubleshooting guide",
        "Refund policy internal document",
        "Billing issue resolution SOP",
        "VPN connectivity troubleshooting steps",
        "Order cancellation workflow",
        "Login authentication failure guide",
        "Technical escalation handbook",
    ]

    ticket_counter = 1
    thread_counter = 1

    tickets_to_add = []
    threads_to_add = []

    for day in range(10):  # last 10 days

        tickets_per_day = random.randint(5, 8)

        for _ in range(tickets_per_day):

            user_id, username = random.choice(users)

            category, intent = random.choice(categories)

            created_time = datetime.now(UTC) - timedelta(
                days=day,
                hours=random.randint(1, 23),
                minutes=random.randint(1, 59)
            )

            priority = random.choice(["Low", "Medium", "High"])

            ticket_id = f"TCK{ticket_counter:03d}"

            # ---------------- Scenario Selection ----------------

            scenario = random.choice([
                "Resolved",
                "AI Processing",
                "Human Review",
                "Manual Handling"
            ])

            ai_confidence = round(random.uniform(55, 98), 1)

            # ---------------- RESOLVED ----------------

            if scenario == "Resolved":

                status = "Resolved"

                resolution_state = "Closed"

                resolved_by = random.choice([
                    "AI",
                    "AI+Human",
                    "Human"
                ])

                if resolved_by in ["AI", "AI+Human"]:
                    retrieved_documents = random.sample(sample_documents, k=random.randint(2, 4))
                else:
                    retrieved_documents = None

                ai_response = (
                    f"AI generated response for {category.lower()} issue."
                )

                final_response = (
                    f"{category} issue resolved successfully."
                )

            # ---------------- AI PROCESSING ----------------

            elif scenario == "AI Processing":

                status = "AI Processing"

                resolution_state = "Pending"

                resolved_by = None
                retrieved_documents = None

                ai_response = (
                    f"AI is currently processing the {category.lower()} issue."
                )

                final_response = None

            # ---------------- HUMAN REVIEW ----------------

            elif scenario == "Human Review":

                status = "Human Review"

                resolution_state = "Needs Review"

                resolved_by = None

                ai_confidence = round(random.uniform(55, 74), 1)
                
                retrieved_documents = random.sample(sample_documents, k=random.randint(2, 5))

                ai_response = (
                    f"Low-confidence AI response for {category.lower()} issue."
                )

                final_response = None

            # ---------------- MANUAL HANDLING ----------------

            else:

                status = "Manual Handling"

                resolution_state = "In Progress"

                resolved_by = "Human"

                priority = "High"

                ai_response = None

                ai_confidence = None
                
                retrieved_documents = None

                final_response = (
                    "Ticket directly escalated to human agent."
                )

            # ---------------- Create Ticket ----------------

            ticket = Ticket(
                ticket_id=ticket_id,
                user_id=user_id,
                username=username,

                category=category,

                title_query=f"{category} issue reported",

                ticket_description=(
                    f"Customer reported a {category.lower()} related issue."
                ),

                status=status,

                created_at=created_time,

                intent=intent,

                priority=priority,

                ai_response=ai_response,

                ai_confidence=ai_confidence,

                retrieved_documents=retrieved_documents,

                final_response=final_response,

                resolution_state=resolution_state,

                resolved_by=resolved_by
            )

            tickets_to_add.append(ticket)

            # ---------------- THREADS ----------------

            if scenario in ["Human Review", "Manual Handling"]:

                thread = Thread(
                    thread_id=f"THR{thread_counter:03d}",

                    ticket_id=ticket_id,

                    current_node="human_review",

                    current_state={
                        "intent": intent,
                        "priority": priority,
                        "draft_response": ai_response,
                        "confidence": ai_confidence
                    },

                    status="Running" if scenario == "Manual Handling" else "Completed",

                    interrupt_reason=(
                        "Low confidence flagged for review"
                        if scenario == "Human Review"
                        else "High priority escalated to human"
                    ),

                    resume_answer=final_response,

                    last_run_at=created_time + timedelta(minutes=20)
                )

                threads_to_add.append(thread)

                thread_counter += 1

            ticket_counter += 1

    try:

        db.add_all(tickets_to_add)

        db.add_all(threads_to_add)

        db.commit()

        print(f"{len(tickets_to_add)} tickets inserted")
        print(f"{len(threads_to_add)} threads inserted")

    finally:
        db.close()