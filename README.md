# ReguMind AI

> AI-powered regulatory compliance platform for document analysis, obligation tracking, risk scoring, and audit-ready compliance workflows.

## System Architecture

![ReguMind AI Architecture](https://assets.leetcode.com/users/images/9fa012dd-bbf3-4c0d-a552-22b9871842e5_1780254897.95465.png)

**High-Level Architecture Overview**

* React frontend for compliance dashboards and document management.
* Express.js backend exposing secure REST APIs.
* Google OAuth + JWT for authentication and authorization.
* Gemini-powered AI agent layer for regulation analysis and compliance automation.
* MongoDB Atlas for persistent storage.
* File storage layer for regulatory PDFs and evidence documents.

---

## Current Status

ReguMind AI is under active development.

---

### Better Repository Structure

```text
ReguMind_Project/
│
├── docs/
│   ├── regumind-architecture.png
│   └── workflow.png
│
├── backend/
├── frontend/
├── README.md
└── AGENT.md
```

Then commit:

```bash
mkdir docs
```

Move the image:

```text
docs/regumind-architecture.png
```

and reference it:

```md
![ReguMind AI Architecture](./docs/regumind-architecture.png)
```

---

### One More Improvement

Add a project progress section:

```md
## Progress Tracker

### Phase 1: Foundation
- [x] Backend Setup
- [x] MongoDB Integration
- [x] Google OAuth
- [x] JWT Authentication
- [x] React Frontend

### Phase 2: Document Management
- [ ] PDF Upload
- [ ] Document Storage
- [ ] Metadata Tracking

### Phase 3: AI Compliance Engine
- [ ] PDF Parsing
- [ ] Gemini Integration
- [ ] Obligation Extraction
- [ ] MAP Generation

### Phase 4: Compliance Operations
- [ ] Department Mapping
- [ ] Risk Scoring
- [ ] Evidence Validation
- [ ] Audit Reports
```
