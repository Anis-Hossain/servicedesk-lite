# ServiceDesk Lite

A customer support & ticket management system built for the full-stack internship assignment. Support staff can log in, track tickets through their full lifecycle, manage customers, and view live dashboards — all backed by a real REST API and relational database.

**Stack:** Next.js (frontend) · Spring Boot (backend REST API) · PostgreSQL (database) · Docker

---

## 1. Project Overview

ServiceDesk Lite has 8 pages:

| Page | Route | Purpose |
|---|---|---|
| Login | `/login` | Staff sign-in |
| Dashboard | `/dashboard` | Live ticket counts, priority breakdown, recent tickets |
| Ticket List | `/tickets` | Searchable, filterable ticket table |
| Ticket Details | `/tickets/[id]` | Full ticket view, status changes, activity notes |
| Create Ticket | `/tickets/new` | New ticket form |
| Customer List | `/customers` | Searchable customer directory |
| Customer Details | `/customers/[id]` | Customer profile + ticket history |
| Team & Reports | `/reports` | Staff workload and resolution-rate report (the optional 8th page) |

Demo data (6 customers, 3 staff, 12 tickets with comments) is seeded automatically on first backend startup — no manual setup needed to try it out.

---

## 2. Prerequisites

- **Docker** and **Docker Compose** (recommended — this is the easiest way to run everything)
- For running without Docker: **Java 17+**, **Maven 3.9+**, **Node.js 20+**, and a local **PostgreSQL** (optional — an in-memory H2 database is used automatically when no Docker profile is active)

---

## 3. Quick Start (Docker — recommended)

From the project root:

```bash
docker compose up --build
```

This builds and starts three containers: PostgreSQL, the Spring Boot backend, and the Next.js frontend.

Once it's up:

| Service | URL |
|---|---|
| Frontend (app) | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger / OpenAPI docs | http://localhost:8080/swagger-ui.html |

**Demo login accounts** (also shown on the login screen):

| Email | Password | Role |
|---|---|---|
| `agent@servicedesk.local` | `Agent123!` | Support Agent |
| `admin@servicedesk.local` | `Admin123!` | Administrator |

To stop everything: `docker compose down` (add `-v` to also wipe the database volume).

---

## 4. Running Without Docker (local development)

### Backend

```bash
cd backend
mvn spring-boot:run
```

With no `SPRING_PROFILES_ACTIVE` set, it defaults to the `local` profile, which uses an **in-memory H2 database** — nothing to install. The backend starts on `http://localhost:8080` and seeds demo data automatically.

- H2 console (if you want to inspect the DB directly): http://localhost:8080/h2-console
  (JDBC URL: `jdbc:h2:mem:servicedesk`, user `sa`, empty password)

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and talks to the backend at the URL in `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080`).

---

## 5. Environment Variables

### Backend

| Variable | Default | Used for |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `local` | `local` = H2 in-memory, `docker` = PostgreSQL |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `db` / `5432` / `servicedesk` | PostgreSQL connection (docker profile) |
| `DB_USERNAME` / `DB_PASSWORD` | `servicedesk` / `servicedesk` | PostgreSQL credentials (docker profile) |
| `JWT_SECRET` | dev placeholder | Signing secret for auth tokens — **set a real secret in production** |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Allowed frontend origin(s) |

### Frontend

| Variable | Default | Used for |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base URL the browser uses to call the backend |

`NEXT_PUBLIC_API_URL` is baked in at build time (it's a Next.js public env var). Docker Compose passes it as a build arg; see `docker-compose.yml`.

---

## 6. Database

Relational schema with 4 tables — see `diagrams/er-diagram.png` for the full entity-relationship diagram:

- **customers** — people who raise tickets
- **staff_users** — support agents/admins who log in and resolve tickets
- **tickets** — the core entity: belongs to one customer, optionally assigned to one staff member
- **ticket_comments** — activity log / internal notes on a ticket, one-to-many with tickets

The schema is created automatically by Hibernate (`ddl-auto: update` in Docker, `create-drop` locally), and realistic seed data is inserted by `DataSeeder` on first boot — this replaces a manual `data.sql` so passwords are properly BCrypt-hashed and dates are generated relative to "now" for a realistic demo.

---

## 7. API Documentation (Swagger / OpenAPI)

Every endpoint is documented and testable directly from the browser once the backend is running:

**http://localhost:8080/swagger-ui.html**

To try authenticated endpoints in Swagger: call `POST /api/auth/login`, copy the returned `token`, click **Authorize** in Swagger UI, and paste it as `Bearer <token>`.

Raw OpenAPI spec (JSON): `http://localhost:8080/v3/api-docs`

---

## 8. Project Structure

```
servicedesk-lite/
├── backend/                  Spring Boot REST API
│   ├── src/main/java/com/servicedesk/lite/
│   │   ├── controller/       REST endpoints
│   │   ├── service/          Business logic
│   │   ├── repository/       Spring Data JPA repositories
│   │   ├── entity/           JPA entities (Customer, Ticket, StaffUser, TicketComment)
│   │   ├── dto/               Request/response records
│   │   ├── config/            Security, JWT, OpenAPI, data seeding
│   │   └── exception/         Centralized error handling
│   ├── src/main/resources/application.yml
│   └── Dockerfile
├── frontend/                 Next.js app (App Router, TypeScript, Tailwind)
│   └── src/
│       ├── app/               Pages (login, dashboard, tickets, customers, reports)
│       ├── components/        Shared UI (AppShell, badges, form primitives)
│       └── lib/                API client, auth context, toast notifications, types
├── diagrams/                  Architecture and ER diagrams (PNG + source .dot files)
├── docker-compose.yml
└── README.md
```

---

## 9. Key Design Decisions

- **Auth:** stateless JWT bearer tokens issued on login, validated on each request by a `OncePerRequestFilter`. Tokens are stored in `localStorage` on the frontend and attached to every API call.
- **Status workflow:** `OPEN → IN_PROGRESS → WAITING_FOR_CUSTOMER → RESOLVED`. Setting a ticket to `RESOLVED` stamps `resolvedAt`; moving it off `RESOLVED` clears that stamp.
- **Dashboard data** is computed live from the database on every request (ticket counts, priority breakdown, 5 most recent tickets) — never hard-coded.
- **Validation** happens on both ends: the frontend blocks obviously invalid submissions before they're sent, and the backend independently validates every request with Bean Validation, returning structured `400` errors with field-level messages.
- **Error/loading/empty states** are handled explicitly on every page (spinners, retry buttons, empty-state messaging) — no unhandled blank screens.

---

## 10. Assumptions, Limitations & Notes

- **Roles are stored but not yet used for authorization** — both `AGENT` and `ADMIN` currently have the same permissions. In a real production system, admin-only actions (e.g., deleting tickets, managing staff accounts) would be gated by role.
- **No staff self-registration UI** — staff accounts are seeded directly; adding an admin "manage team" screen was left out to stay focused on the required scope.
- **Ticket "activity" is a single comment/note stream**, not a full audit log of every field change (e.g., status changes aren't separately logged as activity entries, only as a state change).
- Passwords are hashed with BCrypt; the demo `JWT_SECRET` in `docker-compose.yml` is a placeholder — replace it before any real deployment.
- Optional 8th page implemented as **Team & Reports**: shows per-agent open-ticket workload and an overall resolution rate, computed from live data.
