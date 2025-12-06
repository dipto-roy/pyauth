# PyAuth Frontend

Modern Next.js frontend for the PyAuth authentication system with JWT tokens, role-based access control, and comprehensive user management.

## 🚀 Features

- **Next.js 14 App Router** - Server and client components with TypeScript
- **Chakra UI + Tailwind CSS** - Modern, responsive UI components
- **Zustand State Management** - Lightweight and efficient global state
- **JWT Authentication** - Secure token-based auth with HTTP cookies
- **Zod Validation** - Client-side form validation
- **Protected Routes** - Route guards for authenticated and admin-only pages
- **Token Expiration Alerts** - User warnings before session expires
- **Role-Based UI** - Conditional rendering based on user roles
- **Error Handling** - Comprehensive error messages for all scenarios

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI Library | Chakra UI + Tailwind CSS |
| State Management | Zustand |
| HTTP Client | Axios |
| Validation | Zod |
| Auth Storage | HTTP Cookies (js-cookie) |
| JWT Handling | jwt-decode |

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- PyAuth backend running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Environment Variables

`.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📄 Available Pages

| Route | Description | Auth Required | Role Required |
|-------|-------------|---------------|---------------|
| `/` | Landing page | No | - |
| `/login` | Login page | No | - |
| `/register` | Registration page | No | - |
| `/dashboard` | User dashboard | Yes | Any |
| `/admin` | Admin panel | Yes | Admin |

## 🔐 Authentication Flow

1. **Register** → Auto-login → Dashboard
2. **Login** → Store JWT in cookie → Fetch user → Dashboard
3. **Protected Routes** → Check token → Validate role → Allow/Deny
4. **Logout** → Clear cookie → Clear state → Redirect

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📄 License

MIT License - Dip Roy
