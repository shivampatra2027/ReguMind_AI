# ReguMind AI Frontend

Vite React frontend for the ReguMind AI regulatory compliance workflow.

## Current Progress

- Google login with `@react-oauth/google`.
- JWT and user profile storage in `localStorage`.
- Protected app routes with React Router.
- Dashboard with upload and document history entry points.
- PDF upload page with drag-and-drop, file validation, upload progress, and success/error states.
- Document History page that lists uploaded documents.
- Analysis page integrated with `GET /api/documents/:id/analysis`.
- Analysis view displays the document title, summary, analysis status, and obligations table.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- React Icons
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
/documents
/upload
/analysis
/analysis/:id
/risk
/audit
/evidence
/chatbot
```

Protected routes redirect to `/login` when no JWT token is present in `localStorage`.

## Auth Flow

1. User signs in with Google on `/login`.
2. Google returns an ID token credential.
3. Frontend sends the credential to `POST /api/auth/google`.
4. Backend returns a JWT and user object.
5. Frontend stores `token` and `user` in `localStorage`.
6. Protected API calls send `Authorization: Bearer <token>`.

## Document Workflow

1. User uploads a PDF from `/upload`.
2. Backend stores the document metadata and returns the document id.
3. User can view uploaded documents from `/documents`.
4. Each document includes a `View Analysis` link to `/analysis/:id`.
5. The analysis page calls:

```http
GET /api/documents/:id/analysis
Authorization: Bearer <jwt>
```

6. The page displays:

- Document title.
- Summary card.
- Analysis status.
- Obligations table with `Title`, `Department`, `Priority`, and `Deadline`.

## Analysis States

The analysis page handles:

- No selected document at `/analysis`.
- Loading state while fetching analysis.
- Backend error responses such as `403` and `404`.
- Empty summary or empty obligations.
- Successful analysis data display.
