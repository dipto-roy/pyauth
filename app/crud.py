"""
CRUD (Create, Read, Update, Delete) operations for database models.

Provides reusable database operations for the User model.
"""

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import User
from app.schemas import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Get a user by email address.
    
    Args:
        db: Database session
        email: Email address to search for
        
    Returns:
        User instance if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """
    Get a user by ID.
    
    Args:
        db: Database session
        user_id: User ID to search for
        
    Returns:
        User instance if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_create: UserCreate) -> User:
    """
    Create a new user in the database.
    
    Args:
        db: Database session
        user_create: User creation data
        
    Returns:
        Newly created User instance
    """
    hashed_password = get_password_hash(user_create.password)
    
    db_user = User(
        email=user_create.email,
        hashed_password=hashed_password,
        full_name=user_create.full_name,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """
    Authenticate a user by email and password.
    
    Args:
        db: Database session
        email: User email
        password: Plain text password
        
    Returns:
        User instance if authentication successful, None otherwise
    """
    user = get_user_by_email(db, email)
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user


def update_user_role(db: Session, user_id: int, role: str) -> User | None:
    """
    Update a user's role.
    
    Args:
        db: Database session
        user_id: User ID to update
        role: New role value
        
    Returns:
        Updated User instance if found, None otherwise
    """
    user = get_user_by_id(db, user_id)
    
    if not user:
        return None
    
    user.role = role
    db.commit()
    db.refresh(user)
    
    return user
