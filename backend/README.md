# ReguMind AI Backend

Initial Node.js backend scaffold for the ReguMind AI regulatory compliance platform.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication dependencies
- Multer
- Google Gemini API integration placeholder

## Installation

```bash
cd backend
npm install
```

## Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update `MONGODB_URI`, `JWT_SECRET`, and future API keys as needed.

## Run Commands

```bash
npm run dev
```

```bash
npm start
```

## Health Check

```http
GET /
```

Returns a basic JSON response when the server is running.

## Next Recommended Steps

- Add database models for users, documents, and regulations.
- Implement authentication controllers, routes, and middleware.
- Add document upload handling with Multer.
- Add parser, risk, and Gemini service implementations.
- Add validation, centralized error handling, and tests.
