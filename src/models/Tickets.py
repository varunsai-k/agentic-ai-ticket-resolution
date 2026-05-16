from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base
from sqlalchemy import Column, String, Text, Float, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY


class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id = Column(String(20), primary_key=True)

    user_id = Column(String(20), ForeignKey("users.user_id"), nullable=False)
    username = Column(String(50), nullable=False)

    category = Column(String(50))
    title_query = Column(Text, nullable=False)
    ticket_description = Column(Text)

    status = Column(String(30))
    created_at = Column(TIMESTAMP, server_default=func.now())

    intent = Column(String(100))

    priority = Column(String(20))

    ai_response = Column(Text)
    ai_confidence = Column(Float)
    retrieved_documents = Column(ARRAY(Text))

    final_response = Column(Text)

    resolution_state = Column(String(30))

    resolved_by = Column(String(20))

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('Manual Handling','AI Processing','Human Review','Resolved')",
            name="check_status"
        ),
        CheckConstraint(
            "priority IN ('Low','Medium','High')",
            name="check_priority"
        ),
        CheckConstraint(
            "resolved_by IN ('AI','Human','AI+Human')",
            name="check_resolved_by"
        ),
    )

    # Relationships
    user = relationship("User", back_populates="tickets")
    threads = relationship("Thread", back_populates="ticket", cascade="all, delete")