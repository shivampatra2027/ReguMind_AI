# ReguMind AI

> Transforming Regulatory Compliance with Agentic Intelligence

## Overview

ReguMind AI is an AI-powered Regulatory Compliance Operating System designed to help banks and financial institutions automate the compliance lifecycle.

Financial organizations regularly receive regulatory circulars from RBI, SEBI, and other authorities. Compliance teams spend significant time manually reviewing documents, identifying obligations, assigning ownership, tracking implementation, validating evidence, and preparing audit reports.

ReguMind AI streamlines this process through intelligent document analysis, automated action planning, risk assessment, and compliance monitoring.

---

## Problem Statement

Current compliance workflows are:

- Manual and time-consuming
- Difficult to track across departments
- Error-prone
- Poorly auditable
- Highly dependent on human coordination

As regulatory complexity grows, institutions face increasing operational and compliance risks.

---

## Solution

ReguMind AI automates the end-to-end compliance workflow:

```text
Regulatory PDF
        ↓
Document Analysis
        ↓
Obligation Extraction
        ↓
MAP Generation
        ↓
Department Assignment
        ↓
Risk Scoring
        ↓
Evidence Validation
        ↓
Audit Report Generation
```

---

## Core Features

### Document Intelligence

- Upload RBI / SEBI circulars
- Automated document parsing
- Regulation summarization
- Obligation extraction

### MAP Generation

- Generate Management Action Points (MAPs)
- Assign responsible departments
- Track completion status

### Risk Scoring Engine

Calculate compliance risk based on:

- Regulation severity
- Deadline proximity
- Implementation status
- Overdue actions

### Compliance Dashboard

- Compliance overview
- Active regulations
- Pending actions
- Risk analytics

### Audit Reporting

- Compliance history
- Evidence tracking
- Audit-ready reports

---

## AI Agents

### Regulation Parser Agent

Extracts regulatory obligations from uploaded documents.

### MAP Generator Agent

Creates actionable compliance tasks from extracted obligations.

### Department Mapping Agent

Maps compliance actions to responsible departments.

### Risk Scoring Agent

Calculates dynamic compliance risk.

### Validation Agent

Validates supporting evidence uploaded by teams.

### Audit Reporting Agent

Generates audit-ready compliance reports.

---

## Tech Stack

### Frontend

- React.js
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas

### AI Layer

- Google Gemini API

### File Processing

- PDF Parser

### Authentication

- JWT

### Deployment

- Vercel (Frontend)
- Render / Railway (Backend)

---

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
│
├── uploads/
├── .env.example
├── server.js
└── package.json
```

---

## MVP Scope

### Included

- User Authentication
- PDF Upload
- Regulation Extraction
- MAP Generation
- Department Assignment
- Risk Scoring
- Compliance Dashboard
- Audit Report Generation

### Future Scope

- Real-time RBI Monitoring
- SEBI Monitoring
- ERP Integrations
- Autonomous Escalations
- Predictive Compliance Analytics
- Multilingual Support

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd regumind-ai
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=
```

### Run Development Server

```bash
npm run dev
```

### Production

```bash
npm start
```

---

## API Roadmap

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Documents

```http
POST /api/document/upload
```

### Regulations

```http
POST /api/regulation/analyze
GET /api/regulation/all
```

### MAPs

```http
GET /api/maps
```

### Reports

```http
GET /api/audit-report/:id
```

---

## Development Roadmap

### Phase 1

- Backend Initialization
- MongoDB Setup
- Authentication
- File Upload

### Phase 2

- PDF Processing
- Gemini Integration
- Regulation Extraction

### Phase 3

- MAP Generation
- Risk Scoring
- Dashboard APIs

### Phase 4

- Audit Reports
- Deployment
- Demo Preparation

---

## Team

### Pixel_Potato

- Shivam Patra
- Anjali Anand
- Amisha Mishra

---

## Vision

ReguMind AI aims to transform compliance management from a reactive manual process into a proactive AI-driven compliance ecosystem for modern financial institutions.
