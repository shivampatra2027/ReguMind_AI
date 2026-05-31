# ReguMind AI

AI-powered regulatory compliance platform for document analysis, obligation tracking, risk scoring, and audit-ready compliance workflows.

## Current Status

ReguMind AI is under active development. The current implementation includes:

- Express backend scaffold
- MongoDB connection setup
- Google OAuth login API
- JWT-based protected profile route
- Vite React frontend
- Google login UI
- Protected dashboard

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- `@react-oauth/google`

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Google OAuth via `google-auth-library`

## Project Structure

```text
ReguMind_Project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── AGENT.md
└── README.md
```

## Environment Setup

### Backend

Create `backend/src/.env` or `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/regumind_ai
JWT_SECRET=replace_with_a_secure_secret
GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=
```

### Frontend

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:5000/api
```

Use the same Google OAuth client ID in both backend and frontend env files.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Development

Start the backend API:

```bash
cd backend
npm run dev
```

Start the frontend app:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Authentication Flow

1. Frontend renders Google login using `@react-oauth/google`.
2. Google returns an ID token credential.
3. Frontend posts the credential to `POST /api/auth/google`.
4. Backend verifies the Google token.
5. Backend creates or updates the user in MongoDB.
6. Backend returns a JWT and user profile.
7. Frontend stores `token` and `user` in `localStorage`.
8. Dashboard is protected by the stored token and profile verification.

## API Endpoints

### Health

```http
GET /
```

### Auth

```http
POST /api/auth/google
GET /api/auth/profile
```

`GET /api/auth/profile` requires:

```http
Authorization: Bearer <jwt>
```

## Frontend Routes

```text
/login
/dashboard
```

`/dashboard` is protected and redirects to `/login` when no token is present.

## Build

Build frontend:

```bash
cd frontend
npm run build
```

Start backend in production mode:

```bash
cd backend
npm start
```

## Product Vision

ReguMind AI aims to help compliance teams move from manual regulatory tracking to an AI-assisted operating model for document review, action planning, risk monitoring, and audit readiness.
