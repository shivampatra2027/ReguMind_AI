# ReguMind AI Backend

Express.js API for the ReguMind AI regulatory compliance platform.

## Features

- Express API server
- MongoDB connection with Mongoose
- Google OAuth token verification
- JWT generation and verification
- Protected profile endpoint
- Modular controller, route, middleware, model, and service structure

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- `google-auth-library`
- `dotenv`
- `cors`
- `nodemon`

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── services/
│   └── app.js
├── .env.example
├── package.json
└── server.js
```

## Installation

```bash
cd backend
npm install
```

## Environment

Create `src/.env` or `.env` from `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/regumind_ai
JWT_SECRET=replace_with_a_secure_secret
GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=
```

`GOOGLE_CLIENT_ID` must match the frontend `VITE_GOOGLE_CLIENT_ID`.

## Run Commands

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## Health Check

```http
GET /
```

Success response:

```json
{
  "status": "ok",
  "message": "ReguMind AI backend is running"
}
```

## Auth API

### Google Login

```http
POST /api/auth/google
Content-Type: application/json
```

Request:

```json
{
  "credential": "google_id_token"
}
```

Success response:

```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "compliance_officer",
    "picture": "..."
  }
}
```

### Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt>
```

Success response:

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "compliance_officer",
    "picture": "..."
  }
}
```

## Error Responses

- `400` Missing credential
- `401` Invalid Google token or invalid JWT
- `404` User not found
- `500` Internal server error

## Notes

- `server.js` loads environment variables from `backend/.env` and `backend/src/.env`.
- `npm run dev` uses `nodemon`.
- MongoDB connection is skipped when `MONGODB_URI` is not set.
