# ReguMind AI Frontend

Vite React frontend for Google authentication and the protected ReguMind AI dashboard.

## Features

- Google login with `@react-oauth/google`
- Axios auth service
- JWT and user profile storage in `localStorage`
- Protected dashboard route
- Logout flow
- Tailwind CSS styling

## Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- `@react-oauth/google`

## Installation

```bash
cd frontend
npm install
```

## Environment

Create `.env` from `.env.example`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_GOOGLE_CLIENT_ID` must match the backend `GOOGLE_CLIENT_ID`.

## Run Commands

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Routes

```text
/login
/dashboard
```

`/dashboard` is protected and redirects to `/login` when no token is present.

## Auth Flow

1. User signs in with Google on `/login`.
2. Google returns an ID token credential.
3. Frontend sends the credential to `POST /api/auth/google`.
4. Backend returns a JWT and user object.
5. Frontend stores `token` and `user` in `localStorage`.
6. Dashboard loads the profile from `GET /api/auth/profile`.
