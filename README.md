# Notes App

A full-stack notes application with markdown editing, tags, search, auto-save, and optimistic UI updates.

**Stack:** React + TypeScript + Tailwind + React Query (frontend) · Express + TypeScript + PostgreSQL/Neon (backend)

---

## Quick Start

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd notes-app

# Backend
cd backend
cp .env.example .env
# Edit .env with your Neon DATABASE_URL
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure environment

**backend/.env**
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Run locally

```bash
# Terminal 1 — Backend (auto-runs DB migration on start)
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Run tests

```bash
cd backend && npm test
cd frontend && npm test
```

---

## Project Structure

```
notes-app/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── app.ts            # Express app setup
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic + DB queries
│   │   ├── routes/           # Route definitions
│   │   ├── middleware/       # Validation, error handling
│   │   ├── validators/       # Zod schemas
│   │   ├── db/               # Pool, migrations
│   │   └── types/            # Shared TypeScript types
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── api/              # HTTP client + API functions
│   │   ├── components/
│   │   │   ├── layout/       # Header, shell
│   │   │   ├── notes/        # Note list, editor, tags
│   │   │   └── ui/           # Spinner, dialogs, empty states
│   │   ├── hooks/            # React Query hooks, debounce, shortcuts
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Helpers
│   └── src/test/
│
└── README.md
```

---

## Tech Stack & Rationale

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + TS | Type safety, component model, ecosystem |
| Styling | Tailwind CSS | Utility-first, fast iteration, responsive |
| Data fetching | TanStack Query | Caching, optimistic updates, loading/error states |
| Backend | Express + TS | Simple, well-known, easy to explain |
| Database | PostgreSQL (Neon) | Real SQL, GIN index for tags, free hosted tier |
| Validation | Zod | Shared pattern for request validation |
| Content | Markdown | Portable, readable raw, easy preview — no WYSIWYG complexity |

---

## Architecture

```
┌─────────────┐     HTTP/JSON      ┌─────────────┐     SQL      ┌──────────┐
│   React UI  │ ◄───────────────► │  Express API │ ◄──────────► │  Neon PG │
│ React Query │   optimistic UI   │  Zod validate│              │  notes   │
└─────────────┘                   └─────────────┘              └──────────┘
```

**Data flow:**
1. UI reads/writes via React Query hooks (`useNotes`, `useUpdateNote`, etc.)
2. Mutations apply optimistic cache updates; rollback on API failure
3. Auto-save debounces PATCH requests (800ms) while editing
4. Search debounces GET requests (300ms)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List notes (`search`, `tag`, `sort`, `order`, `page`, `limit`) |
| GET | `/api/notes/:id` | Get single note |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/tags` | All tags with usage counts |
| GET | `/api/health` | Health check |

**Error shape:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [{ "field": "title", "message": "..." }]
  }
}
```

---

## Features

- List, create, edit, delete notes (delete with confirmation)
- Debounced search across title + content
- Tags: add, filter, color-coded badges
- Sort by created, updated, or title
- Auto-save while editing (debounced)
- Markdown editor with live preview toggle
- Optimistic UI with rollback on failure
- Loading, empty, error, and offline states
- Responsive layout (mobile sidebar + desktop split view)
- Keyboard shortcuts: `⌘N` new, `⌘K` search, `Delete` remove, `?` help

---

## Deployment

### Backend → Render

1. Push repo to GitHub
2. [Render](https://render.com) → New **Web Service** → connect repo
3. Root directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Environment variables:
   - `DATABASE_URL` — Neon connection string
   - `CORS_ORIGIN` — your Vercel URL (e.g. `https://notes-app.vercel.app`)
   - `PORT` — Render sets this automatically

### Frontend → Vercel

1. [Vercel](https://vercel.com) → Import repo
2. Root directory: `frontend`
3. Environment variable:
   - `VITE_API_URL` — `https://your-api.onrender.com/api`

### Database → Neon

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string to `DATABASE_URL`
3. Tables are created automatically on first backend start

---

## Testing Approach

- **Backend:** Integration tests with Supertest against the Express app (health, CRUD, validation). Requires `DATABASE_URL` for full run; skips DB tests when unset.
- **Frontend:** Unit tests for pure helpers (`parseTagsInput`, `truncate`, tag colors).

Focused on behavior that matters — API contracts and utility logic — rather than snapshot-heavy UI tests.

---
