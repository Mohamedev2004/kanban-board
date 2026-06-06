# Kanban Board

A full-stack **Kanban board** application — a web app for organizing work into
columns (To Do / In Progress / Done) — built on top of a production-style
platform foundation: authentication, role-based dashboards, in-app + email
notifications, audit logging, and full internationalization.

> **Status:** Fully implemented — the platform (auth, roles, notifications,
> audit logs, i18n, theming) **plus** the Tasks module: a drag-and-drop Kanban
> board, a server-driven data table, role-scoped visibility, an automatic
> system-managed "overdue" status, and analytics dashboards.

The repository is a monorepo with two apps:

| Folder    | App      | Stack                                            |
| --------- | -------- | ------------------------------------------------ |
| `client/` | Frontend | React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| `server/` | Backend  | Go, Gin, GORM, PostgreSQL                        |

---

## Tech Stack

**Frontend (`client/`)**
- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix UI primitives)
- TanStack Query (data fetching) & TanStack Table
- Drag-and-drop Kanban via **@dnd-kit**
- React Router v7
- i18n in **English, French, and Arabic** (with full RTL support)
- Light/dark theming, framer-motion, Recharts, command palette
- Vitest + Testing Library for tests

**Backend (`server/`)**
- Go 1.26 + Gin
- GORM with **PostgreSQL** (two databases: app data + audit logs)
- JWT auth with access + refresh tokens (httpOnly cookies)
- Watermill event bus for async emails, notifications, and audit logging
- SendGrid (SMTP) for transactional email
- Excel export for logs (excelize)

---

## Features

- 🔐 **Authentication** — register, login, logout, forgot/reset password, refresh-token rotation
- 👥 **Role-based access** — admin and user dashboards
- 🔔 **Notifications** — in-app feed + email delivery, driven by an event bus
- 📜 **Audit logs** — written to a dedicated logs database, with Excel export
- 🌍 **Internationalization** — English, French, Arabic (RTL-aware)
- 🎨 **Theming** — light/dark mode
- 🗂️ **Tasks & Kanban** — drag-and-drop board + server-driven data table; tasks have title, description, tags, status, priority, type (bug/ticket/epic) and due date
- ⏰ **Auto-overdue** — a daily background job flags past-due tasks as `overdue` (a locked, system-managed column)
- 📊 **Analytics dashboards** — KPI cards + Recharts charts (status/priority/type breakdowns, created-over-time, per-user) for users and admins

---

## Tasks & Kanban

The Tasks module is the core feature. A **task** has: `id`, `user_id` (owner),
`title`, `description`, `tags` (string array), `status`, `priority`
(`low`/`medium`/`high`), `type` (`bug`/`ticket`/`epic`), and `due_date`.

**Two views, one dataset:**
- **Kanban board** — four columns (To Do → In Progress → Done → Overdue) with
  drag-and-drop between columns (optimistic update, rolled back on error).
- **Data table** — server-driven search, filtering (status/priority/type),
  column sorting, and pagination.

**Role-scoped visibility:** regular users see and manage only their own tasks;
admins see **all** tasks and get an extra **Owner** column on the table plus an
owner badge on each Kanban card.

**Overdue is system-managed:** the `overdue` status is never set by hand. A
background job (runs on startup, then every 24h) flips any past-due task that
isn't done into `overdue`. Overdue tasks are **locked** for everyone — they
can't be edited, deleted, moved, or dragged in/out (the API returns
`409 task_overdue_locked` if attempted).

**Dashboards:** both the user and admin dashboards render KPI cards and Recharts
charts driven by `GET /api/v1/tasks/stats` (role-scoped). Admins additionally
get a "tasks by user" breakdown.

**Audit trail:** every task mutation (create / update / status change / delete)
and each overdue sweep publishes an event on the Watermill bus that is written
to the audit-logs database — the same pipeline as the rest of the app.

### Task API

All routes are under `/api/v1/tasks` and require authentication.

| Method | Path                | Purpose                                  |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/tasks`            | Paginated list (filter / search / sort)  |
| GET    | `/tasks/board`      | All in-scope tasks, for the Kanban board |
| GET    | `/tasks/stats`      | Dashboard KPIs + chart data              |
| POST   | `/tasks`            | Create a task                            |
| GET    | `/tasks/:id`        | Fetch one task                           |
| PUT    | `/tasks/:id`        | Update a task                            |
| PATCH  | `/tasks/:id/status` | Change status (used by drag-and-drop)    |
| DELETE | `/tasks/:id`        | Delete a task                            |

---

## Prerequisites

- **Go** 1.26 or newer
- **Node.js** 22 or newer + npm
- **PostgreSQL** 14 or newer, running and reachable

---

## Getting Started

Clone the repo, then set up the two apps. The backend and frontend run as
separate processes.

### 1. Backend (`server/`)

```bash
cd server

# Create your environment file (see "Environment Variables" below)
cp .env.example .env   # then edit values

# Install Go dependencies
go mod download

# Run the API server.
# On first run it auto-creates the "kanban_db" and "kanban_db_logs"
# databases and applies migrations.
go run ./cmd
```

The API listens on **http://localhost:8080** (base path `/api/v1`).

**Seeding data (optional):**

```bash
# Seed baseline data (migrations + seed)
go run ./cmd/seed

# Reset everything: DROP both databases, recreate, migrate, seed dev data
# ⚠️ Destructive — wipes your local data.
go run ./cmd/devseed
```

### 2. Frontend (`client/`)

```bash
cd client

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs on **http://localhost:5174** and talks to the backend at
`http://localhost:8080/api/v1` by default.

---

## Environment Variables

### `server/.env`

```dotenv
# Database (PostgreSQL)
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432            # PostgreSQL default (the app uses Postgres)
DB_NAME=kanban_db       # a "<name>_logs" DB is created alongside it

# Server
PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5174
FRONTEND_URL=http://localhost:5174

# JWT (required — the server refuses to start without a secret)
JWT_SECRET=change_me_to_a_long_random_string
JWT_ACCESS_EXPIRY_MINUTES=15
JWT_REFRESH_EXPIRY_DAYS=7

# Mail (SendGrid SMTP)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=you@example.com
MAIL_FROM_NAME=Kanban

# Cookies
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_DOMAIN=
COOKIE_SAMESITE=Lax
```

> **Note:** `JWT_SECRET` is required — the server exits on startup if it is
> empty. Also set `DB_PORT=5432`; the code's built-in fallback is `3306`, which
> is incorrect for PostgreSQL.

### `client/.env`

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

> `.env` files are gitignored — never commit real secrets.

---

## Running Tests

**Backend:**

```bash
cd server
go test ./...
```

**Frontend:**

```bash
cd client
npm test
```

---

## Database Seeding

Two seed entrypoints populate the databases with demo data so you can log in
and see a populated board immediately.

| Command                | What it does                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `go run ./cmd/seed`    | Connects, migrates, and seeds **idempotently** — safe to re-run; only fills in what's missing. |
| `go run ./cmd/devseed` | **Destructive reset:** drops both databases, recreates, migrates, then seeds fresh dev data. ⚠️ |

**What gets seeded**

- **Roles:** `admin` and `user`.
- **Accounts:**
  - `cmd/seed` → `admin@app.com` / `Admin2025!` and `user@app.com` / `User2025!`
  - `cmd/devseed` → the admin above plus demo users `alice`, `bob`, `carol`
    (`<name>@app.com` / `User2025!`)
- **Notifications:** a batch of demo in-app notifications per user.
- **Tasks:** ~12 demo tasks per user with randomized status, priority, type,
  tags, and due dates. Seeding is **idempotent** — users who already own tasks
  are skipped.

> **Overdue tasks:** the seeder only assigns `todo` / `in_progress` / `done`.
> Once the API server starts, the overdue background job marks any seeded task
> whose `due_date` is already in the past as `overdue` — so the Overdue column
> fills in shortly after launch.

---

## Continuous Integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request
to `main` (and can be triggered manually via `workflow_dispatch`). In-progress
runs for the same ref are auto-cancelled, the workflow token runs with
least-privilege (`contents: read`), and both jobs cache their dependencies and
run in parallel:

- **Backend (Go):** `gofmt` formatting check → `go vet` → `go build ./...` →
  `go test ./...`
- **Frontend (React):** `npm ci` → `npm run lint` (ESLint) → `npm run typecheck`
  (tsc) → `npm run build` → `npm test` (Vitest)
