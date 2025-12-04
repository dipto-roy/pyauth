"""
Authentication endpoints for user registration and login.

Provides endpoints for:
- POST /auth/register - Create new user account
- POST /auth/login - Authenticate and receive JWT token
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.crud import authenticate_user, create_user, get_user_by_email
from app.db.session import get_db
from app.schemas import LoginRequest, Token, UserCreate, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email, password, and optional full name.",
)
async def register(
    user_create: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """
    Register a new user account.
    
    Args:
        user_create: User registration data (email, password, full_name)
        db: Database session
        
    Returns:
        The created user's information (excluding password)
        
    Raises:
        HTTPException: 400 if email is already registered
    """
    # Check if user already exists
    existing_user = get_user_by_email(db, user_create.email)
    
    if existing_user:
        logger.warning(f"Registration attempt with existing email: {user_create.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    user = create_user(db, user_create)
    logger.info(f"New user registered: {user.email} (id: {user.id})")
    
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Login and get access token",
    description="Authenticate with email and password to receive a JWT access token.",
)
async def login(
    login_request: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    """
    Authenticate user and return JWT access token.
    
    Args:
        login_request: Login credentials (email, password)
        db: Database session
        
    Returns:
        Access token and token type
        
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    # Authenticate user
    user = authenticate_user(db, login_request.email, login_request.password)
    
    if not user:
        logger.warning(f"Failed login attempt for: {login_request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        logger.warning(f"Login attempt by inactive user: {login_request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user ID and role in payload
    access_token = create_access_token(
        data={
            "sub": user.id,
            "role": user.role.value,
        }
    )
    
    logger.info(f"User logged in: {user.email} (id: {user.id})")
    
    return Token(access_token=access_token, token_type="bearer")
