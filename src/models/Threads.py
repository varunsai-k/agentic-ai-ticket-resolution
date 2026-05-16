from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from src.database import Base
from sqlalchemy import Column, String, Text, Float, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class Thread(Base):
    __tablename__ = "threads"

    thread_id = Column(String(50), primary_key=True)

    ticket_id = Column(String(50), ForeignKey("tickets.ticket_id"), nullable=False)

    current_node = Column(String(100))
    current_state = Column(JSONB)

    status = Column(String(30))

    interrupt_reason = Column(Text)
    resume_answer = Column(Text)

    last_run_at = Column(TIMESTAMP, server_default=func.now())

    # Relationship
    ticket = relationship("Ticket", back_populates="threads")
