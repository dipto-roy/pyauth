# PyAuth - FastAPI Authentication & Authorization

A production-ready FastAPI authentication system with JWT tokens, role-based authorization, SQLAlchemy ORM, and PostgreSQL.

**Author:** Dip Roy

## ✨ Features

- 🔐 **JWT Authentication** - Access tokens with configurable expiration (default: 15 min)
- 👥 **Role-Based Authorization** - User and Admin roles with protected endpoints
- 🗄️ **PostgreSQL + SQLAlchemy** - Modern ORM with type hints
- 🔄 **Alembic Migrations** - Database version control
- 🔒 **Secure Password Hashing** - bcrypt via passlib
- ✅ **21 Pytest Tests** - Full test coverage for auth flows
- 📝 **Pydantic Validation** - Request/response validation
- 🌐 **CORS Enabled** - Ready for frontend integration

## 🛠️ Tech Stack

| Category   | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | FastAPI 0.123+                      |
| Database   | PostgreSQL + SQLAlchemy 2.0         |
| Auth       | python-jose (JWT), passlib (bcrypt) |
| Migrations | Alembic                             |
| Validation | Pydantic 2.x                        |
| Testing    | Pytest + HTTPX                      |
| Server     | Uvicorn                             |

## Project Structure

```
pyauth/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py          # /auth/register & /auth/login endpoints
│   │   └── protected.py     # /protected/user & /protected/admin routes
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Pydantic settings (loads .env)
│   │   └── security.py      # bcrypt hashing & python-jose JWT
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py       # SQLAlchemy engine & session factory
│   ├── __init__.py
│   ├── crud.py              # get_user_by_email, create_user, authenticate_user
│   ├── deps.py              # get_current_user, require_role dependencies
│   ├── models.py            # User model with UserRole enum (USER, ADMIN)
│   └── schemas.py           # Pydantic request/response schemas
├── alembic/
│   ├── versions/
│   │   └── 001_create_users_table.py
│   ├── env.py
│   └── script.py.mako
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Test fixtures & in-memory SQLite DB
│   └── test_auth.py         # 21 comprehensive auth tests
├── .env                     # Your environment variables (git-ignored)
├── .gitignore
├── alembic.ini
├── docker-compose.yml       # Optional: PostgreSQL container
├── Makefile                 # make run, make test, etc.
├── requirements.txt
└── README.md
```

## Quick Start

### 1. Clone and Setup

```bash
cd pyauth

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
# Generate a secure secret key
openssl rand -hex 32
```

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pyauth
SECRET_KEY=your-256-bit-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=15
```

> ⚠️ **Important:** `DATABASE_URL` and `SECRET_KEY` have no defaults and must be set.

### 3. Setup PostgreSQL

**Option A: Local PostgreSQL**

```bash
# Create database
psql -U postgres -c "CREATE DATABASE pyauth;"
```

**Option B: Docker Compose**

```bash
docker-compose up -d
```

### 4. Run Database Migrations

```bash
alembic upgrade head
```

### 5. Start the Development Server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using make
make run
```

The API will be available at http://localhost:8000

### 6. Explore the API

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint           | Description         | Auth Required    |
| ------ | ------------------ | ------------------- | ---------------- |
| GET    | `/public`          | Public endpoint     | No               |
| POST   | `/auth/register`   | Register new user   | No               |
| POST   | `/auth/login`      | Login and get token | No               |
| GET    | `/protected/user`  | User-only endpoint  | Yes (any role)   |
| GET    | `/protected/admin` | Admin-only endpoint | Yes (admin role) |

## Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secretpass123", "full_name": "John Doe"}'
```

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secretpass123"}'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Access Protected Route

```bash
curl http://localhost:8000/protected/user \
  -H "Authorization: Bearer <your_access_token>"
```

## Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=app
```

## Environment Variables

| Variable                      | Description                                                                         | Required         |
| ----------------------------- | ----------------------------------------------------------------------------------- | ---------------- |
| `DATABASE_URL`                | PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/pyauth`) | ✅ Yes           |
| `SECRET_KEY`                  | JWT signing key (256-bit hex string recommended)                                    | ✅ Yes           |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time in minutes                                                    | No (default: 15) |

> Generate a secure secret key: `openssl rand -hex 32`

## Development Commands

```bash
make run        # Start development server (uvicorn --reload)
make test       # Run all 21 tests with pytest
make migrate    # Run alembic upgrade head
make revision   # Create new migration (edit message in Makefile)
```

## Creating an Admin User

By default, users register with the `user` role. To promote a user to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Security Notes

- Passwords are hashed with **bcrypt** (12 rounds)
- JWT tokens use **HS256** algorithm
- Tokens contain user ID in the `sub` claim (as string per RFC 7519)
- `SECRET_KEY` and `DATABASE_URL` must be set in `.env` (no defaults)
- `.env` is git-ignored to prevent accidental commits

## Test Coverage

All 21 tests cover:

- User registration (valid, duplicate email, weak password)
- User login (valid, wrong email/password)
- JWT token validation and expiration
- Protected endpoint access control
- Admin-only endpoint authorization
- Token format and error handling

Run tests:

```bash
pytest -v
# Output: 21 passed ✅
```

## License

MIT License - Dip Roy
