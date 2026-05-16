from src.database import engine, SessionLocal
from src.models.Users import User
from src.models.Tickets import Ticket
from src.models.Threads import Thread
from src.seed import seed_users, seed_tickets
from sqlalchemy import text
from src.database import Base, SessionLocal

def init_db():

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:

        # Check if users already exist
        existing_user = db.query(User).first()

        if existing_user:
            print("Database already initialized")
            return

        print("Seeding database...")

        seed_users(db)
        seed_tickets(db)

        print("Database seeded successfully")

    finally:
        db.close()