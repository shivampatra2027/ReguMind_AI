# ReguMind AI Backend

Express.js API for the ReguMind AI regulatory compliance platform.

## Current Progress

- Google OAuth login with JWT issuance.
- JWT-protected API routes.
- PDF document upload with Multer.
- PDF text extraction service.
- Gemini-powered compliance analysis.
- MongoDB persistence for document metadata, raw text, summaries, obligations, and processing statuses.
- Protected document analysis read API with ownership checks.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- Google Auth Library
- Google Gemini API
- Multer
- pdf-parse
- dotenv
- cors
- nodemon

## Project Structure

```text
backend/
|-- src/
|   |-- config/
|   |   |-- db.js
|   |   `-- multer.js
|   |-- controllers/
|   |   |-- auth.controller.js
|   |   `-- document.controller.js
|   |-- middleware/
|   |   `-- auth.middleware.js
|   |-- models/
|   |   |-- Document.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- auth.routes.js
|   |   `-- document.routes.js
|   |-- services/
|   |   |-- gemini.service.js
|   |   `-- pdf.service.js
|   `-- app.js
|-- uploads/
|-- .env.example
|-- package.json
`-- server.js
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
GEMINI_API_KEY=your_gemini_api_key
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

## Document API

All document endpoints require:

```http
Authorization: Bearer <jwt>
```

### Upload Document

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

Form fields:

- `file`: PDF file, maximum 10 MB.
- `title`: optional document title.

### List Documents

```http
GET /api/documents
```

Returns documents uploaded by the authenticated user.

### Get Document

```http
GET /api/documents/:id
```

Returns a single owned document, including extracted text when available.

### Extract Text

```http
POST /api/documents/:id/extract
```

Extracts PDF text and updates `processingStatus`.

### Analyze Document

```http
POST /api/documents/:id/analyze
```

Runs Gemini analysis on extracted text and stores `summary`, `obligations`, and `analysisStatus`.

### Get Analysis

```http
GET /api/documents/:id/analysis
```

Returns the saved analysis for a document. The route validates the document id, verifies document ownership, returns `404` when the document does not exist, and returns `403` when the authenticated user does not own it.

Success response:

```json
{
  "success": true,
  "documentId": "...",
  "title": "...",
  "summary": "...",
  "analysisStatus": "completed",
  "obligations": [
    {
      "title": "...",
      "department": "...",
      "priority": "...",
      "deadline": "..."
    }
  ]
}
```

## Error Responses

- `400` Invalid input, invalid document id, missing file, or document text not extracted.
- `401` Missing or invalid JWT.
- `403` Authenticated user does not own the requested document.
- `404` User or document not found.
- `500` Internal server error.

## Notes

- `server.js` loads environment variables from `backend/.env` and `backend/src/.env`.
- Uploaded PDFs are stored under `backend/uploads`.
- `npm run dev` uses `nodemon`.
- MongoDB connection is skipped when `MONGODB_URI` is not set.
