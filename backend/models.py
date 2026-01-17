import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


def generate_invite_code():
    return uuid.uuid4().hex[:6].upper()


class Household(Base):
    __tablename__ = "households"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    invite_code = Column(String(6), unique=True, nullable=False, default=generate_invite_code)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    members = relationship("User", back_populates="household")
    tasks = relationship("Task", back_populates="household", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    avatar_color = Column(String(7), default="#f97316")
    household_id = Column(String(36), ForeignKey("households.id"), nullable=True)
    magic_token = Column(String(255), nullable=True, index=True)
    magic_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    household = relationship("Household", back_populates="members")
    tasks_created = relationship("Task", back_populates="created_by_user", foreign_keys="Task.created_by")
    tasks_claimed = relationship("Task", back_populates="claimed_by_user", foreign_keys="Task.claimed_by")
    tasks_completed = relationship("Task", back_populates="completed_by_user", foreign_keys="Task.completed_by")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    household_id = Column(String(36), ForeignKey("households.id"), nullable=False)
    title = Column(Text, nullable=False)
    claimed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    completed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    household = relationship("Household", back_populates="tasks")
    created_by_user = relationship("User", back_populates="tasks_created", foreign_keys=[created_by])
    claimed_by_user = relationship("User", back_populates="tasks_claimed", foreign_keys=[claimed_by])
    completed_by_user = relationship("User", back_populates="tasks_completed", foreign_keys=[completed_by])
