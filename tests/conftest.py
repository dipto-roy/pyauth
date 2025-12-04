"""
Pytest configuration and fixtures for testing.

Provides test database setup, client fixtures, and helper functions.
"""

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import get_password_hash
from app.db.session import Base, get_db
from app.main import app
from app.models import User, UserRole

# Use SQLite for testing (in-memory)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Create test engine with SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test.
    
    Yields:
        SQLAlchemy Session instance
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with database dependency override.
    
    Args:
        db: Test database session
        
    Yields:
        FastAPI TestClient instance
    """
    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db: Session) -> User:
    """
    Create a test user in the database.
    
    Args:
        db: Database session
        
    Returns:
        Created User instance
    """
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        role=UserRole.USER,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db: Session) -> User:
    """
    Create a test admin user in the database.
    
    Args:
        db: Database session
        
    Returns:
        Created admin User instance
    """
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("adminpassword123"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def user_token(client: TestClient, test_user: User) -> str:
    """
    Get an access token for the test user.
    
    Args:
        client: Test client
        test_user: Test user fixture
        
    Returns:
        JWT access token string
    """
    response = client.post(
        "/auth/login",
        json={"email": "testuser@example.com", "password": "testpassword123"},
    )
    return response.json()["access_token"]


@pytest.fixture
def admin_token(client: TestClient, test_admin: User) -> str:
    """
    Get an access token for the test admin.
    
    Args:
        client: Test client
        test_admin: Test admin fixture
        
    Returns:
        JWT access token string
    """
    response = client.post(
        "/auth/login",
        json={"email": "admin@example.com", "password": "adminpassword123"},
    )
    return response.json()["access_token"]


def get_auth_header(token: str) -> dict[str, str]:
    """
    Create authorization header with bearer token.
    
    Args:
        token: JWT access token
        
    Returns:
        Dictionary with Authorization header
    """
    return {"Authorization": f"Bearer {token}"}
