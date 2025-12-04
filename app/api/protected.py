"""
Protected endpoints demonstrating authentication and authorization.

Provides endpoints for:
- GET /protected/user - Requires authenticated user (any role)
- GET /protected/admin - Requires admin role
"""

import logging

from fastapi import APIRouter

from app.deps import AdminUser, CurrentUser
from app.schemas import ProtectedMessage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/protected", tags=["Protected"])


@router.get(
    "/user",
    response_model=ProtectedMessage,
    summary="User protected endpoint",
    description="Accessible by any authenticated user regardless of role.",
)
async def user_protected(current_user: CurrentUser) -> ProtectedMessage:
    """
    Protected endpoint accessible by any authenticated user.
    
    Args:
        current_user: The authenticated user (injected by dependency)
        
    Returns:
        Welcome message with user information
    """
    logger.info(f"User {current_user.id} accessed /protected/user")
    
    return ProtectedMessage(
        message=f"Hello, {current_user.full_name or current_user.email}! You are authenticated.",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role.value,
    )


@router.get(
    "/admin",
    response_model=ProtectedMessage,
    summary="Admin protected endpoint",
    description="Accessible only by users with the 'admin' role.",
)
async def admin_protected(admin_user: AdminUser) -> ProtectedMessage:
    """
    Protected endpoint accessible only by admin users.
    
    Uses the AdminUser type alias which includes the require_role("admin") dependency.
    
    Args:
        admin_user: The authenticated admin user (injected by dependency)
        
    Returns:
        Welcome message with admin user information
    """
    logger.info(f"Admin {admin_user.id} accessed /protected/admin")
    
    return ProtectedMessage(
        message=f"Welcome, Admin {admin_user.full_name or admin_user.email}! You have admin privileges.",
        user_id=admin_user.id,
        user_email=admin_user.email,
        user_role=admin_user.role.value,
    )
