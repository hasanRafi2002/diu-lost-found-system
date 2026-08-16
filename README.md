# diuFindit — DIU Lost & Found Platform

diuFindit is a full‑stack Lost & Found web platform built for **Daffodil International University (DIU)**. Students and staff can report items they've lost or found, browse open reports, submit claims on found items, and get notified as claims are reviewed — all in one place instead of scattered Facebook posts and word of mouth.

The project is organized as a **monorepo** with a React (Vite) frontend and a FastAPI + PostgreSQL backend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Backend setup](#2-backend-setup)
  - [3. Frontend setup](#3-frontend-setup)
  - [4. Running everything together](#4-running-everything-together)
- [Environment Variables](#environment-variables)
- [Database & Migrations](#database--migrations)
- [Seeding Categories](#seeding-categories)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Image Uploads](#image-uploads)
- [Rate Limiting](#rate-limiting)
- [Admin Access](#admin-access)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Known Issues / TODOs](#known-issues--todos)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Report lost or found items** with title, description, category, brand, color, and precise on-campus location (building / floor / room / specific spot), plus an optional photo.
- **Browse & search** Lost Items and Found Items separately, with category filtering and pagination.
- **Claim workflow** — anyone can submit a claim ("This is mine" / "I found this") on another user's report. The report owner can approve or reject claims; approving a claim automatically resolves the item and rejects competing pending claims.
- **In-app notifications** — users are notified when someone claims their item and when their own claim is approved or rejected.
- **My Reports** — a personal dashboard of everything a user has reported.
- **Profile management** — edit your name, phone, and department, and upload a profile photo.
- **Admin Dashboard** — platform-wide stats (users, items, claims), user management (activate/deactivate), and item moderation.
- **Secure image uploads** — uploaded images are re-validated, re-encoded, and stripped of unsafe metadata server-side (not just trusted by MIME type).
- **Hardened auth** — JWT-based auth with per-account and per-IP login rate limiting, and security headers (CSP, X-Frame-Options, HSTS, etc.) on every response.

---

## Tech Stack

**Frontend**
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [MUI (Material UI) v9](https://mui.com/) — primary component library for pages like Home, Profile, Contact, Navbar
- [Tailwind CSS](https://tailwindcss.com/) — utility classes used across item listing/detail/claim components
- [React Router v7](https://reactrouter.com/)
- [Axios](https://axios-http.com/) for API calls
- [react-hot-toast](https://react-hot-toast.com/) for notifications/toasts
- [lucide-react](https://lucide.dev/) and [@heroicons/react](https://heroicons.com/) for icons
- [lottie-react](https://github.com/Gamote/lottie-react) for the homepage hero animation
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) for Google sign-in

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/) via [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- [Alembic](https://alembic.sqlalchemy.org/) for database migrations
- [Pydantic v2](https://docs.pydantic.dev/) / `pydantic-settings` for schemas & config
- [python-jose](https://github.com/mpdavis/python-jose) for JWTs, [passlib](https://passlib.readthedocs.io/) (bcrypt) for password hashing
- [Pillow](https://python-pillow.org/) for server-side image validation & re-encoding
- [Uvicorn](https://www.uvicorn.org/) as the ASGI server

---

## Project Structure

```
diuFindit/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routers (auth, items, categories, claims, notifications, admin)
│   │   ├── core/             # config, security (JWT/password hashing), rate limiting
│   │   ├── database/         # SQLAlchemy engine/session setup
│   │   ├── models/           # SQLAlchemy models (User, Item, Category, Claim, Notification)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # business logic layer
│   │   ├── middleware.py     # security headers middleware
│   │   └── main.py           # FastAPI app entrypoint
│   ├── alembic/               # database migrations
│   ├── uploads/                # uploaded item images (gitignored, keep .gitkeep)
│   ├── seed_categories.py     # seeds default item categories
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── assets/            # static assets (logos, etc.)
│   │   ├── animations/        # Lottie JSON animations
│   │   ├── components/        # shared UI components (Navbar, Footer, ItemCard, ClaimForm, etc.)
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/              # route-level pages (Home, LostItems, FoundItems, Profile, Admin, etc.)
│   │   ├── services/           # Axios API service modules
│   │   ├── theme/              # MUI theme definitions (light/dark)
│   │   ├── App.jsx             # routes
│   │   └── main.jsx            # app entrypoint
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## Prerequisites

Make sure you have the following installed before you start:

| Tool | Recommended Version |
|---|---|
| [Node.js](https://nodejs.org/) | 20.19+ or 22.12+ (required by Vite 8) |
| [npm](https://www.npmjs.com/) | comes with Node |
| [Python](https://www.python.org/) | 3.11+ |
| [PostgreSQL](https://www.postgresql.org/) | 14+ |
| pip / venv | comes with Python |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/diuFindit.git
cd diuFindit
```

### 2. Backend setup

```bash
cd backend

# create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # on Windows: .venv\Scripts\activate

# install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (see [Environment Variables](#environment-variables) below for all required values):

```bash
cp .env.example .env   # if you have an example file, otherwise create it manually
```

Create the PostgreSQL database (adjust the name/user to match your `DATABASE_URL`):

```bash
createdb diufindit
```

Run migrations to create all tables:

```bash
alembic upgrade head
```

Seed the default item categories (Wallet, Phone, Laptop, ID Card, Book, Bag, Bottle, Watch, Jewelry, Keys, Electronics, Others):

```bash
python seed_categories.py
```

Start the backend dev server:

```bash
uvicorn app.main:app --reload
```

By default the API will be available at **http://localhost:8000**, with interactive docs at **http://localhost:8000/docs**.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend

# install dependencies
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (Vite's default).

### 4. Running everything together

You need **two terminals** running at the same time during development:

```bash
# terminal 1 — backend
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload

# terminal 2 — frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Environment Variables

### `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/diufindit` |
| `SECRET_KEY` | ✅ | — | Secret used to sign JWTs. **Must be at least 32 characters.** Generate one with `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | ❌ | `HS256` | JWT signing algorithm (only `HS256` is currently supported) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `60` | JWT access token lifetime in minutes |
| `MAX_UPLOAD_SIZE_MB` | ❌ | `5` | Max allowed item image upload size |
| `ALLOWED_IMAGE_TYPES` | ❌ | `image/jpeg,image/png,image/webp` | Comma-separated list of accepted image MIME types |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:5173` | Comma-separated list of allowed CORS origins for the frontend |

Example `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/diufindit
SECRET_KEY=change-this-to-a-long-random-string-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
MAX_UPLOAD_SIZE_MB=5
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_ORIGINS=http://localhost:5173
```

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Base URL of the backend API, e.g. `http://localhost:8000` |

---

## Database & Migrations

Migrations are managed with **Alembic** and live in `backend/alembic/versions/`. Current migration history creates, in order: `users` → `categories` + `items` → `claims` → `notifications` → a partial unique index preventing duplicate pending claims per user/item.

Common commands (run from `backend/`, with your virtualenv active):

```bash
# apply all pending migrations
alembic upgrade head

# roll back the last migration
alembic downgrade -1

# generate a new migration after changing a model
alembic revision --autogenerate -m "describe your change"

# check current migration state
alembic current
```

> ⚠️ Always review autogenerated migrations before applying them — Alembic doesn't catch everything (e.g. renamed columns, changed enum values).

---

## Seeding Categories

`backend/seed_categories.py` inserts a default set of item categories if they don't already exist. Run it once after your first migration:

```bash
cd backend
python seed_categories.py
```

It's idempotent — safe to re-run at any time without creating duplicates.

---

## API Overview

All endpoints are prefixed and grouped by router. Full interactive documentation (Swagger UI) is available at `/docs` once the backend is running.

| Router | Prefix | Purpose |
|---|---|---|
| Auth | `/api/auth` | register, login, get current user |
| Items | `/api/items` | create/list/get/update/delete items, image upload, status updates, "my reports" |
| Categories | `/api/categories` | list active item categories |
| Claims | `/api/items/{id}/claims`, `/api/claims/{id}/...` | submit, list, approve, reject, cancel claims |
| Notifications | `/api/notifications` | list, unread count, mark as read (single/all) |
| Admin | `/api/admin` | dashboard stats, user list, deactivate/reactivate users, item moderation |

There's also a plain health check at `GET /health`.

---

## Authentication

- Auth uses **JWT bearer tokens**. On login, the frontend stores `access_token` in `localStorage` and attaches it via an Axios interceptor (`Authorization: Bearer <token>`).
- Tokens are signed with `SECRET_KEY` and expire after `ACCESS_TOKEN_EXPIRE_MINUTES`.
- A 401 response from the API automatically logs the user out client-side and redirects to `/login`.
- Passwords are hashed with **bcrypt** via `passlib`.

---

## Image Uploads

Item photos are uploaded to `POST /api/items/{item_id}/image` as `multipart/form-data`. The backend:

1. Rejects unsupported MIME types up front.
2. Enforces a max size (`MAX_UPLOAD_SIZE_MB`) without reading the whole body into memory first.
3. Actually decodes the image with Pillow (rejecting files that merely *claim* to be images).
4. Strips animated frames, normalizes EXIF orientation, and **re-encodes** the image server-side — the original uploaded bytes are never written to disk.
5. Saves the result under `backend/uploads/items/` with a randomly generated filename, served statically at `/uploads/...`.

Uploads are additionally rate-limited to 20 per user/IP per hour.

---

## Rate Limiting

A simple in-memory sliding-window rate limiter (`backend/app/core/rate_limit.py`) protects:

- **Login**: 5 attempts per account / 30 per IP, per 15 minutes.
- **Registration**: 10 attempts per IP, per 15 minutes.
- **Image uploads**: 20 per IP, per hour.

> Note: because this is in-memory, limits reset on server restart and aren't shared across multiple backend instances. For production/multi-instance deployments, swap this for a shared store (e.g. Redis).

---

## Admin Access

There is no self-serve "become an admin" flow. To create an admin account:

1. Register a normal account through the app.
2. Manually update that user's `role` to `ADMIN` in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

3. Log out and back in — the Navbar will show an **Admin Panel** link, and `/admin` becomes accessible.

---

## Available Scripts

### Frontend (`frontend/package.json`)

| Command | Description |
|---|---|
| `npm run dev` | start the Vite dev server |
| `npm run build` | build a production bundle into `dist/` |
| `npm run preview` | preview the production build locally |
| `npm run lint` | run ESLint |

### Backend

| Command | Description |
|---|---|
| `uvicorn app.main:app --reload` | start the API in dev mode with hot reload |
| `alembic upgrade head` | apply database migrations |
| `python seed_categories.py` | seed default categories |

---

## Troubleshooting

- **`ValueError: SECRET_KEY must be at least 32 characters long`** — your `.env` `SECRET_KEY` is too short; generate a longer one.
- **CORS errors in the browser console** — make sure `ALLOWED_ORIGINS` in `backend/.env` includes the exact origin the frontend is served from (including port), and that `VITE_API_URL` in `frontend/.env` points at the backend.
- **`relation "users" does not exist`** — you haven't run migrations yet; run `alembic upgrade head`.
- **Images fail to upload with "Invalid or corrupted image"** — the file either isn't a real image, exceeds `MAX_UPLOAD_SIZE_MB`, or is an animated GIF (not supported for item photos).
- **401 loop / instantly logged out** — check that your system clock is correct (JWT expiry is time-based) and that `SECRET_KEY` hasn't changed between issuing and validating a token.

---

## Known Issues / TODOs

These are known gaps in the current codebase worth being aware of:

- `Profile.jsx`'s save handler is still a stub (`// TODO: Connect to backend`) — it doesn't yet call the profile update API.
- `Contact.jsx`'s contact form doesn't send anywhere yet (`// TODO: Connect to backend email service`) — it only logs to console.
- The rate limiter is in-memory only (see [Rate Limiting](#rate-limiting)) — not suitable for multi-instance deployments as-is.
- The frontend currently mixes **MUI** and **Tailwind CSS** across different pages/components — this is intentional during the ongoing UI refinement phases but should eventually be consolidated.

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/my-change`.
2. Make your changes, following the existing patterns (services layer for backend business logic, `services/*.js` for frontend API calls).
3. Run the linter (`npm run lint` in `frontend/`) and make sure the backend starts cleanly.
4. If you changed a SQLAlchemy model, generate a migration: `alembic revision --autogenerate -m "..."`.
5. Open a pull request describing what changed and why.

---

## License

This project currently has no explicit license file. Treat it as **all rights reserved** unless a `LICENSE` file is added, or check with the project maintainer before reuse.
