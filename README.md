# PKMS — Personal Knowledge Management System

A full-stack personal knowledge base. Store notes, bookmarks, and learning materials in one place. Search across everything.

---

## Tech stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Backend   | Node.js + Express                 |
| Database  | SQLite (via `better-sqlite3`)     |
| Auth      | JWT in httpOnly cookies           |
| Frontend  | React 18 + Vite                   |
| Routing   | React Router v6                   |
| Data      | TanStack Query (React Query v5)   |
| Styling   | Plain CSS with design tokens      |

---

## Setup

### 1. Clone / unzip the project

```
pkms/
├── backend/
└── frontend/
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your own secret keys:

```
PORT=5000
JWT_ACCESS_SECRET=any_long_random_string_here
JWT_REFRESH_SECRET=a_different_long_random_string_here
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

The server starts on `http://localhost:5000`.
The database file `pkms.db` is created automatically on first run.

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.
All `/api` requests are proxied to the backend automatically.

### 4. Open in browser

Go to `http://localhost:5173` — you'll see the login page.
Create an account, then start using the app.

---

## Features

- **Notes** — Create, edit, delete notes with title, content, category, tags. Pin or favourite notes. Link notes to each other bidirectionally.
- **Bookmarks** — Save any URL with title, description, and tags.
- **Materials** — Track books, courses, videos with a progress bar. Tap `+` / `−` to update your current chapter/module.
- **Search** — One search box finds across notes, bookmarks, and materials simultaneously.
- **Dashboard** — Stats overview, recent notes grid, activity feed, learning progress.
- **Auth** — Register + login with JWT access tokens (15min) + refresh tokens (7 days). httpOnly cookies — no localStorage.
- **Theme** — Light and dark mode toggle (saved to localStorage).

---

## API endpoints

| Method | Endpoint                   | What it does               |
|--------|----------------------------|----------------------------|
| POST   | `/api/auth/register`       | Create account             |
| POST   | `/api/auth/login`          | Login, set cookies         |
| POST   | `/api/auth/logout`         | Clear cookies              |
| GET    | `/api/auth/me`             | Get current user           |
| POST   | `/api/auth/refresh`        | Refresh access token       |
| GET    | `/api/notes`               | List notes                 |
| POST   | `/api/notes`               | Create note                |
| GET    | `/api/notes/:id`           | Get note + tags + links    |
| PATCH  | `/api/notes/:id`           | Update note                |
| DELETE | `/api/notes/:id`           | Delete note                |
| POST   | `/api/notes/:id/links`     | Link two notes             |
| DELETE | `/api/notes/:id/links/:tid`| Unlink notes               |
| GET    | `/api/bookmarks`           | List bookmarks             |
| POST   | `/api/bookmarks`           | Add bookmark               |
| PATCH  | `/api/bookmarks/:id`       | Edit bookmark              |
| DELETE | `/api/bookmarks/:id`       | Delete bookmark            |
| GET    | `/api/materials`           | List materials             |
| POST   | `/api/materials`           | Add material               |
| PATCH  | `/api/materials/:id`       | Update progress            |
| DELETE | `/api/materials/:id`       | Delete material            |
| GET    | `/api/tags`                | List tags                  |
| POST   | `/api/tags`                | Create tag                 |
| DELETE | `/api/tags/:id`            | Delete tag                 |
| GET    | `/api/search?q=`           | Search everything          |
| GET    | `/api/stats`               | Dashboard counts           |

---

## Project structure

```
pkms/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js              ← Express entry point
│       ├── db/
│       │   └── index.js        ← SQLite connection + schema
│       ├── middleware/
│       │   ├── auth.js         ← JWT verification
│       │   └── errors.js       ← Central error handler
│       └── routes/
│           ├── auth.js
│           ├── notes.js
│           ├── bookmarks.js
│           ├── materials.js
│           ├── tags.js
│           ├── search.js
│           └── stats.js
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx            ← React + QueryClient entry point
        ├── App.jsx             ← Routes + auth guards
        ├── api.js              ← Fetch wrapper with token refresh
        ├── index.css           ← Design system tokens + all styles
        ├── context/
        │   └── AuthContext.jsx ← User state + theme toggle
        ├── components/
        │   ├── Modal.jsx
        │   └── TagInput.jsx
        └── pages/
            ├── Layout.jsx      ← Sidebar + topbar shell
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Notes.jsx
            ├── NoteView.jsx
            ├── NoteEdit.jsx
            ├── Bookmarks.jsx
            ├── Materials.jsx
            └── Search.jsx
```

---

## Notes

- The SQLite database (`pkms.db`) is created automatically in the `backend/` folder on first run. No setup needed.
- Refresh tokens are rotated on every use for security.
- Tags are created automatically when you type them — no pre-setup needed.
- In production, set `NODE_ENV=production` in `.env` — this enables secure cookies and hides internal error details.
