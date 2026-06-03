# Kanban Board

A full-stack **Kanban board** application — a web app for organizing work into
columns (To Do / In Progress / Done) — built on top of a production-style
platform foundation: authentication, role-based dashboards, in-app + email
notifications, audit logging, and full internationalization.

> **Status:** The platform (auth, roles, notifications, logs, i18n, theming) is
> implemented. The Kanban board view itself is currently a UI scaffold — three
> columns are rendered but the cards/data are not wired up yet.

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
- 🗂️ **Kanban board** — column layout scaffolded (work in progress)

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

## Continuous Integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request
to `main`. Two jobs run in parallel with dependency caching:

- **Backend (Go):** `go test ./...`
- **Frontend (React):** `npm ci && npm test`
