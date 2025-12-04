"""
SQLAlchemy ORM models.

Defines the database schema using SQLAlchemy's declarative syntax.
"""

from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class UserRole(str, PyEnum):
    """
    Enumeration of user roles.
    
    Inherits from str to allow easy serialization and comparison.
    """
    USER = "user"
    ADMIN = "admin"


class User(Base):
    """
    User model representing application users.
    
    Attributes:
        id: Primary key, auto-incremented
        email: Unique email address
        hashed_password: Bcrypt hashed password
        full_name: Optional display name
        role: User role (user or admin)
        is_active: Whether the user account is active
        created_at: Timestamp of account creation
    """
    
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.USER, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
