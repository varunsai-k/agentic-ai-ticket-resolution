from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base
from sqlalchemy import Column, String, Text, Float, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(20), primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    fullname = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    mobile_number = Column(String(20))

    # Relationship
    tickets = relationship("Ticket", back_populates="user", cascade="all, delete")

