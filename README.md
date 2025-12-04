# FastAPI Authentication & Authorization

A production-ready FastAPI skeleton with JWT authentication, role-based authorization, SQLAlchemy ORM, and PostgreSQL.

## Features

- 🔐 JWT-based authentication (access tokens with expiration)
- 👥 Role-based authorization (user/admin roles)
- 🗄️ PostgreSQL database with SQLAlchemy ORM
- 🔄 Alembic migrations
- 🔒 Secure password hashing (bcrypt via passlib)
- 🐳 Docker Compose for local development
- ✅ Pytest test suite

## Project Structure

```
pyauth/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py          # Register & Login endpoints
│   │   └── protected.py     # Protected routes
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings from environment
│   │   └── security.py      # Password hashing & JWT utils
│   ├── db/
│   │   ├── __init__.py
│   │   └── session.py       # Database session management
│   ├── __init__.py
│   ├── crud.py              # Database operations
│   ├── deps.py              # FastAPI dependencies
│   ├── models.py            # SQLAlchemy models
│   └── schemas.py           # Pydantic schemas
├── alembic/
│   ├── versions/
│   │   └── 001_create_users_table.py
│   ├── env.py
│   └── script.py.mako
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_auth.py
├── alembic.ini
├── docker-compose.yml
├── .env.example
├── .gitignore
├── Makefile
├── requirements.txt
└── README.md
```

## Quick Start

### 1. Clone and Setup Environment

```bash
# Copy environment variables
cp .env.example .env

# Edit .env and set a strong SECRET_KEY
# You can generate one with: openssl rand -hex 32
```

### 2. Start PostgreSQL with Docker Compose

```bash
docker-compose up -d
```

### 3. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
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

| Variable                      | Description                                  | Default                                                |
| ----------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`                | PostgreSQL connection string                 | `postgresql://postgres:postgres@localhost:5432/pyauth` |
| `SECRET_KEY`                  | JWT signing key (use a strong random string) | Required                                               |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time                        | `15`                                                   |

## Development Commands

```bash
make run        # Start development server
make test       # Run tests
make migrate    # Run migrations
make revision   # Create new migration (edit message in Makefile)
```

## Creating an Admin User

By default, users are created with the 'user' role. To create an admin user, you can:

1. Register a user normally
2. Update their role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Or modify the registration endpoint to accept a role parameter (for development only).

## License

MIT
