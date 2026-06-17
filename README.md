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

## Suggested Commit History

Copy these commits step-by-step to show your workflow:

```bash
# 1. Project scaffold
git init
git add .gitignore README.md
git commit -m "chore: initialize monorepo with README"

# 2. Backend foundation
git add backend/package.json backend/tsconfig.json backend/.env.example
git add backend/src/index.ts backend/src/app.ts backend/src/types/
git add backend/src/db/ backend/src/middleware/errorHandler.ts
git commit -m "feat(backend): scaffold Express + TypeScript server with PostgreSQL"

# 3. Backend API
git add backend/src/services/ backend/src/controllers/ backend/src/routes/
git add backend/src/validators/ backend/src/middleware/validate.ts
git commit -m "feat(backend): implement notes CRUD API with validation"

# 4. Backend tests
git add backend/tests/ backend/vitest.config.ts backend/render.yaml
git commit -m "test(backend): add API integration tests and Render config"

# 5. Frontend scaffold
git add frontend/package.json frontend/vite.config.ts frontend/tsconfig*.json
git add frontend/index.html frontend/tailwind.config.js frontend/postcss.config.js
git add frontend/src/main.tsx frontend/src/index.css frontend/public/
git commit -m "feat(frontend): scaffold React + Vite + Tailwind app"

# 6. Frontend API layer
git add frontend/src/types/ frontend/src/api/ frontend/src/hooks/
git add frontend/.env.example
git commit -m "feat(frontend): add API client and React Query hooks"

# 7. Frontend UI
git add frontend/src/components/ frontend/src/utils/ frontend/src/App.tsx
git commit -m "feat(frontend): build notes UI with markdown editor and tags"

# 8. Frontend tests + deploy
git add frontend/src/test/ frontend/vercel.json
git commit -m "test(frontend): add unit tests and Vercel config"
```

---

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Markdown over rich text | Simpler, portable — but no WYSIWYG for non-technical users |
| Optimistic updates | Snappy UX — but brief inconsistency if network is slow |
| Auto-save vs explicit save | Less friction — but no "discard changes" without reload |
| Neon PostgreSQL | Production-ready — but requires cloud DB vs local SQLite |
| No auth (core scope) | Faster to ship — notes are shared globally in this demo |

---

## With More Time

- User authentication (JWT + per-user notes)
- Soft delete + trash/restore
- Export notes as Markdown/JSON
- Dark mode toggle
- E2E tests with Playwright
- Conflict resolution for multi-device sync

---

## Known Limitations

- No authentication — all notes are shared in the demo deployment
- Delete keyboard shortcut only works when editor is not focused in a text field
- Render free tier cold starts (~30s) on first request after idle

---

## License

MIT
