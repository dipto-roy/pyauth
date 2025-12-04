"""
Pydantic schemas for request/response validation.

Defines the data transfer objects (DTOs) used by the API.
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRole(str, Enum):
    """User role enumeration for Pydantic models."""
    USER = "user"
    ADMIN = "admin"


# ============== User Schemas ==============

class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    """Schema for user registration request."""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserResponse(UserBase):
    """Schema for user response (excludes password)."""
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserInDB(UserResponse):
    """Schema for user with hashed password (internal use)."""
    hashed_password: str


# ============== Authentication Schemas ==============

class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for JWT token payload."""
    sub: int  # User ID
    role: str
    exp: datetime | None = None


# ============== Message Schemas ==============

class Message(BaseModel):
    """Generic message response."""
    message: str
    
    
class ProtectedMessage(BaseModel):
    """Response for protected endpoints."""
    message: str
    user_id: int
    user_email: str
    user_role: str
