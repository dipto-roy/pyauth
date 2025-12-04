"""
FastAPI dependencies for authentication and authorization.

Provides reusable dependencies for protecting routes.
"""

import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.crud import get_user_by_id
from app.db.session import get_db
from app.models import User

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Dependency that validates JWT token and returns the current user.
    
    This dependency:
    1. Extracts the token from the Authorization header
    2. Validates the JWT signature and expiration
    3. Loads the user from the database
    4. Raises 401 on invalid/expired token or missing user
    
    Args:
        credentials: HTTP Bearer credentials from Authorization header
        db: Database session
        
    Returns:
        The authenticated User instance
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check if Authorization header is present
    if credentials is None:
        logger.warning("Missing Authorization header")
        raise credentials_exception
    
    token = credentials.credentials
    
    # Decode and validate token
    payload = decode_access_token(token)
    
    if payload is None:
        logger.warning("Invalid or expired token")
        raise credentials_exception
    
    # Extract user ID from token (stored as string per JWT spec)
    user_id_str: str | None = payload.get("sub")
    
    if user_id_str is None:
        logger.warning("Token missing 'sub' claim")
        raise credentials_exception
    
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        logger.warning(f"Invalid user ID in token: {user_id_str}")
        raise credentials_exception
    
    # Load user from database
    user = get_user_by_id(db, user_id)
    
    if user is None:
        logger.warning(f"User with id {user_id} not found")
        raise credentials_exception
    
    if not user.is_active:
        logger.warning(f"Inactive user {user_id} attempted access")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def require_role(required_role: str):
    """
    Factory function that creates a dependency for role-based authorization.
    
    Usage:
        @router.get("/admin", dependencies=[Depends(require_role("admin"))])
        def admin_only_route():
            ...
    
    Args:
        required_role: The role required to access the endpoint
        
    Returns:
        A FastAPI dependency function that checks user role
    """
    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        """
        Verify that the current user has the required role.
        
        Args:
            current_user: The authenticated user from get_current_user
            
        Returns:
            The authenticated User instance if authorized
            
        Raises:
            HTTPException: 403 if user doesn't have the required role
        """
        if current_user.role.value != required_role:
            logger.warning(
                f"User {current_user.id} with role '{current_user.role.value}' "
                f"attempted to access resource requiring '{required_role}' role"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges",
            )
        return current_user
    
    return role_checker


# Type alias for dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[User, Depends(require_role("admin"))]
