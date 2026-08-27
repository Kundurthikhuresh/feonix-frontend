# FeonixAI (Next.js + Node + MongoDB Atlas)

Same interview copilot behaviour as the original app, split into:

- **frontend/** — Next.js UI (original screens, overlay, session picker)
- **backend/** — Node.js Express API, now using **MongoDB Atlas**

## Run locally

1. Create a MongoDB Atlas cluster and copy the connection string.
2. In `backend/`, copy `.env.example` to `.env` and set:

```
MONGODB_URI=mongodb+srv://...
MONGODB_DB=feonixai
OPENAI_API_KEY=...
SESSION_SECRET=a-long-random-string
FRONTEND_ORIGIN=http://localhost:3000
```

3. In `frontend/`, copy `.env.example` to `.env.local`:

```
BACKEND_URL=http://localhost:4000
```

4. Install and start from `feonixai-next`:

```
npm run install:all
npm run dev
```

That starts the API on **http://localhost:4000** and the Next.js UI on **http://localhost:3000**.

You can also run them separately:

```
npm run dev:api
npm run dev:web
```

Copy `OPENAI_API_KEY` and `SESSION_SECRET` from the original app’s `.env` into `backend/.env` if you already have them. Replace `MONGODB_URI` with your Atlas string.

The first account you register becomes the **owner**. Later signups need `SIGNUP_CODE` or an admin-created user.

## What stayed the same

- Auth, credits/trials, sessions, live transcribe, answers (SSE), vision, notes, admin
- Overlay at `/overlay.html`, session type at `/session-type.html`, launch at `/launch.html`
- API paths (`/api/auth`, `/api/sessions`, `/api/answer`, …)

## What changed

- SQLite → MongoDB Atlas collections (`users`, `documents`, `usage`, `call_sessions`, …)
- Static HTML UI is served by Next.js; `/api/*` is proxied to the Node server so cookies and streaming still work
