"""
Authentication and authorization tests.

Tests cover:
- User registration flow
- User login flow
- Protected endpoint access
- Role-based authorization
"""

import pytest
from fastapi.testclient import TestClient

from app.models import User
from tests.conftest import get_auth_header


class TestPublicEndpoint:
    """Tests for public endpoints."""
    
    def test_public_endpoint_accessible(self, client: TestClient):
        """Test that public endpoint is accessible without authentication."""
        response = client.get("/public")
        
        assert response.status_code == 200
        assert "message" in response.json()
        assert "public" in response.json()["message"].lower()
    
    def test_health_check(self, client: TestClient):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json()["message"] == "OK"


class TestRegistration:
    """Tests for user registration."""
    
    def test_register_success(self, client: TestClient):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@example.com",
            "password": "securepassword123",
            "full_name": "New User",
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert data["role"] == "user"
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
        # Password should not be returned
        assert "password" not in data
        assert "hashed_password" not in data
    
    def test_register_without_full_name(self, client: TestClient):
        """Test registration without optional full_name."""
        user_data = {
            "email": "noname@example.com",
            "password": "securepassword123",
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] is None
    
    def test_register_duplicate_email(self, client: TestClient, test_user: User):
        """Test registration with already existing email fails."""
        user_data = {
            "email": test_user.email,  # Same email as existing user
            "password": "anotherpassword123",
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_invalid_email(self, client: TestClient):
        """Test registration with invalid email format fails."""
        user_data = {
            "email": "not-an-email",
            "password": "securepassword123",
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 422  # Validation error
    
    def test_register_short_password(self, client: TestClient):
        """Test registration with password shorter than 8 characters fails."""
        user_data = {
            "email": "valid@example.com",
            "password": "short",  # Less than 8 characters
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 422  # Validation error


class TestLogin:
    """Tests for user login."""
    
    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful login returns access token."""
        login_data = {
            "email": "testuser@example.com",
            "password": "testpassword123",
        }
        
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
    
    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login with wrong password fails."""
        login_data = {
            "email": "testuser@example.com",
            "password": "wrongpassword",
        }
        
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent email fails."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "anypassword123",
        }
        
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_inactive_user(self, client: TestClient, db, test_user: User):
        """Test login with inactive user fails."""
        # Deactivate user
        test_user.is_active = False
        db.commit()
        
        login_data = {
            "email": "testuser@example.com",
            "password": "testpassword123",
        }
        
        response = client.post("/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "inactive" in response.json()["detail"].lower()


class TestProtectedUserEndpoint:
    """Tests for the /protected/user endpoint."""
    
    def test_access_with_valid_token(
        self, client: TestClient, test_user: User, user_token: str
    ):
        """Test accessing protected user endpoint with valid token."""
        response = client.get(
            "/protected/user",
            headers=get_auth_header(user_token),
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == test_user.id
        assert data["user_email"] == test_user.email
        assert data["user_role"] == "user"
        assert "message" in data
    
    def test_access_without_token(self, client: TestClient):
        """Test accessing protected endpoint without token fails."""
        response = client.get("/protected/user")
        
        assert response.status_code == 401
        assert "credentials" in response.json()["detail"].lower()
    
    def test_access_with_invalid_token(self, client: TestClient):
        """Test accessing protected endpoint with invalid token fails."""
        response = client.get(
            "/protected/user",
            headers=get_auth_header("invalid.token.here"),
        )
        
        assert response.status_code == 401
    
    def test_access_with_malformed_header(self, client: TestClient):
        """Test accessing protected endpoint with malformed Authorization header."""
        response = client.get(
            "/protected/user",
            headers={"Authorization": "NotBearer sometoken"},
        )
        
        assert response.status_code == 401
    
    def test_admin_can_access_user_endpoint(
        self, client: TestClient, test_admin: User, admin_token: str
    ):
        """Test that admin can access the user endpoint."""
        response = client.get(
            "/protected/user",
            headers=get_auth_header(admin_token),
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_role"] == "admin"


class TestProtectedAdminEndpoint:
    """Tests for the /protected/admin endpoint."""
    
    def test_admin_access(
        self, client: TestClient, test_admin: User, admin_token: str
    ):
        """Test admin can access admin-only endpoint."""
        response = client.get(
            "/protected/admin",
            headers=get_auth_header(admin_token),
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == test_admin.id
        assert data["user_email"] == test_admin.email
        assert data["user_role"] == "admin"
        assert "admin" in data["message"].lower()
    
    def test_regular_user_denied(
        self, client: TestClient, test_user: User, user_token: str
    ):
        """Test regular user is denied access to admin endpoint."""
        response = client.get(
            "/protected/admin",
            headers=get_auth_header(user_token),
        )
        
        assert response.status_code == 403
        assert "insufficient" in response.json()["detail"].lower()
    
    def test_access_without_token(self, client: TestClient):
        """Test accessing admin endpoint without token fails."""
        response = client.get("/protected/admin")
        
        assert response.status_code == 401


class TestTokenExpiration:
    """Tests for JWT token expiration."""
    
    def test_token_contains_required_claims(
        self, client: TestClient, test_user: User
    ):
        """Test that generated token contains required claims."""
        from jose import jwt
        from app.core.config import settings
        
        login_data = {
            "email": "testuser@example.com",
            "password": "testpassword123",
        }
        
        response = client.post("/auth/login", json=login_data)
        token = response.json()["access_token"]
        
        # Decode without verification to check claims
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        
        assert "sub" in payload
        # sub is stored as string per JWT spec
        assert payload["sub"] == str(test_user.id)
        assert "role" in payload
        assert payload["role"] == "user"
        assert "exp" in payload


class TestFullAuthFlow:
    """End-to-end tests for complete authentication flows."""
    
    def test_register_login_access_flow(self, client: TestClient):
        """Test complete flow: register -> login -> access protected resource."""
        # Step 1: Register
        user_data = {
            "email": "flowtest@example.com",
            "password": "flowpassword123",
            "full_name": "Flow Test User",
        }
        
        register_response = client.post("/auth/register", json=user_data)
        assert register_response.status_code == 201
        
        # Step 2: Login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"],
        }
        
        login_response = client.post("/auth/login", json=login_data)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Step 3: Access protected resource
        protected_response = client.get(
            "/protected/user",
            headers=get_auth_header(token),
        )
        assert protected_response.status_code == 200
        data = protected_response.json()
        assert data["user_email"] == user_data["email"]
