# PyAuth - Full Stack Setup Guide

Complete setup guide for the PyAuth authentication system (FastAPI backend + Next.js frontend).

## 🎯 Quick Start

### 1. Start Backend (Terminal 1)

```bash
cd /home/dip-roy/pyauth

# Activate virtual environment
source venv/bin/activate

# Start FastAPI server
make run
# Or: uvicorn app.main:app --reload
```

Backend will be available at: `http://localhost:8000`

### 2. Start Frontend (Terminal 2)

```bash
cd /home/dip-roy/pyauth/frontend

# Start Next.js dev server
npm run dev
```

Frontend will be available at: `http://localhost:3000` (or 3001 if 3000 is in use)

## 📋 Complete Setup from Scratch

### Backend Setup

```bash
# 1. Ensure PostgreSQL is running
sudo service postgresql status

# 2. Create database
psql -U postgres -c "CREATE DATABASE pyauth;"

# 3. Create virtual environment
python -m venv venv
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment
# Create .env file with:
#   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pyauth
#   SECRET_KEY=<generate with: openssl rand -hex 32>
#   ACCESS_TOKEN_EXPIRE_MINUTES=15

# 6. Run migrations
alembic upgrade head

# 7. Start server
make run
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (already done)
npm install

# 3. Verify .env.local exists
# Should contain: NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Start dev server
npm run dev
```

## 🧪 Testing the Application

### 1. Register a New User

```bash
# Visit: http://localhost:3000/register
# Fill form:
#   Email: test@example.com
#   Password: testpass123
#   Full Name: Test User
# Click "Sign Up"
# You'll be auto-logged in and redirected to dashboard
```

### 2. Login

```bash
# Visit: http://localhost:3000/login
# Enter credentials
# Click "Sign In"
# Redirected to dashboard
```

### 3. Test Protected Routes

```bash
# Dashboard (all authenticated users):
http://localhost:3000/dashboard

# Admin Panel (admin only):
http://localhost:3000/admin
# Will show 403 error if user is not admin
```

### 4. Create Admin User

```bash
# In backend terminal:
psql -U postgres -d pyauth

# Run SQL:
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
\q

# Now login with that user and access /admin
```

### 5. Test Token Expiration

```bash
# Login to dashboard
# Wait 14 minutes - you'll see a warning alert
# Wait 15 minutes - you'll be auto-logged out
```

## 🔗 Available Endpoints

### Backend API (http://localhost:8000)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Welcome message | No |
| GET | `/docs` | Swagger UI | No |
| POST | `/auth/register` | Register user | No |
| POST | `/auth/login` | Login & get token | No |
| GET | `/protected/user` | User info | Yes |
| GET | `/protected/admin` | Admin only | Yes (admin) |

### Frontend Pages (http://localhost:3000)

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page | No |
| `/login` | Login page | No |
| `/register` | Registration page | No |
| `/dashboard` | User dashboard | Yes |
| `/admin` | Admin panel | Yes (admin) |

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Frontend will automatically use port 3001
# Or kill the process on port 3000:
lsof -ti:3000 | xargs kill -9
```

### CORS Errors

- Backend CORS is configured for `http://localhost:3000` and `http://127.0.0.1:3000`
- If using port 3001, update `app/main.py`:

```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:3001",  # Add this
]
```

### Database Connection Error

```bash
# Ensure PostgreSQL is running:
sudo service postgresql start

# Verify database exists:
psql -U postgres -l | grep pyauth
```

### 401 Unauthorized Errors

- Token may be expired (15 min lifetime)
- Clear cookies and login again
- Check browser console for detailed errors

### Admin Access Denied (403)

```bash
# Verify user role in database:
psql -U postgres -d pyauth -c "SELECT email, role FROM users;"

# Promote user to admin:
psql -U postgres -d pyauth -c "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
```

## 📦 Project Structure

```
pyauth/
├── app/                    # FastAPI backend
│   ├── api/               # API routes
│   ├── core/              # Config & security
│   ├── db/                # Database session
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   └── main.py            # App entry point
├── frontend/              # Next.js frontend
│   ├── app/              # Pages (App Router)
│   ├── components/        # React components
│   ├── lib/              # API & axios config
│   ├── store/            # Zustand state
│   ├── types/            # TypeScript types
│   └── utils/            # Utilities
├── tests/                 # Backend tests
├── alembic/              # Database migrations
├── .env                  # Backend environment
├── requirements.txt      # Python dependencies
└── README.md             # Main documentation
```

## 🚀 Production Deployment

### Backend

1. Update `.env` with production values
2. Change CORS origins to production frontend URL
3. Set strong `SECRET_KEY`
4. Use production database
5. Deploy with Gunicorn/Docker

### Frontend

1. Update `.env.local` with production API URL
2. Build: `npm run build`
3. Start: `npm run start`
4. Or deploy to Vercel

## 📚 Documentation

- **Backend README**: `/README.md`
- **Frontend README**: `/frontend/README.md`
- **API Docs**: `http://localhost:8000/docs`

## ✅ Feature Checklist

- [x] User registration with validation
- [x] User login with JWT
- [x] Token stored in HTTP cookies
- [x] Protected routes (user & admin)
- [x] Role-based access control
- [x] Token expiration warnings
- [x] Auto-logout on expiration
- [x] Form validation (Zod + Pydantic)
- [x] Error handling (400/401/403/422)
- [x] Responsive UI (Chakra + Tailwind)
- [x] State management (Zustand)
- [x] Type safety (TypeScript)

## 🤝 Contributing

1. Start both backend and frontend
2. Test all authentication flows
3. Verify CORS is working
4. Check error handling
5. Test token expiration
6. Verify role-based access

## 📄 License

MIT License - Dip Roy
