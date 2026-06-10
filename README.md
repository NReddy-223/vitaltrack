# VitalTrack — Personal Health Tracker

A full-stack health tracking app built with **React + TypeScript** (frontend),
**Python FastAPI** (backend), and **Supabase** (database).

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, framer-motion |
| Backend  | Python 3.10+, FastAPI, Uvicorn      |
| Database | Supabase (PostgreSQL)               |
| Auth     | JWT (python-jose) + bcrypt          |
| Deploy   | Vercel (frontend) · Railway (backend) |

---

## Project Structure

```
vitaltrack/
├── src/                    React frontend
│   ├── components/         All screen components
│   ├── context/            AppContext (auth + state)
│   ├── services/           api.ts  ← all fetch calls
│   └── types/              TypeScript interfaces
├── backend/
│   ├── main.py             FastAPI app + all endpoints
│   ├── requirements.txt
│   └── .env.example        ← copy to .env and fill in
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example            Frontend env template
└── .gitignore
```

---

## 1 · Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**
3. Paste and run `supabase/migrations/001_initial_schema.sql`
4. Copy your **Project URL** and **anon/public key** from
   *Project Settings → API*

---

## 2 · Backend Setup

```bash
cd backend
cp .env.example .env        # fill in your Supabase URL, KEY, and a JWT secret
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000`  
Docs available at `http://localhost:8000/docs`

---

## 3 · Frontend Setup

```bash
# from project root
cp .env.example .env.local  # set VITE_API_URL if backend is not on localhost:8000
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 4 · Environment Variables

### Root backend/frontend env

| Variable                    | Description                          |
|-----------------------------|--------------------------------------|
| `SUPABASE_URL`              | Your Supabase project URL            |
| `SUPABASE_KEY`              | Supabase anon/service key            |
| `JWT_SECRET`                | Random secret string (32+ chars)     |
| `JWT_ALGORITHM`             | `HS256` (default)                    |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes (default 60) |
| `VITE_API_URL`              | Optional backend URL for local dev; leave blank for Vercel same-origin `/api` routes |

---

## 5 · Deployment

### Frontend + Backend → Vercel
1. Push to GitHub
2. Import repo into Vercel
3. Set the following env vars in the Vercel project settings:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`
   - `JWT_ALGORITHM` (optional, default is `HS256`)
   - `ACCESS_TOKEN_EXPIRE_MINUTES` (optional, default is `60`)
4. Leave `VITE_API_URL` blank for same-origin `/api` backend routes, or set it to your backend URL if using a separate deployment.
5. Deploy

### Separate Backend Deployment
1. If you want to keep the Python backend in `backend/`, deploy it separately and set its own env vars.
2. Set `VITE_API_URL` in Vercel to your separate backend URL.
4. Railway auto-detects Python and runs `uvicorn main:app --host 0.0.0.0`

---

## API Endpoints

| Method | Path                          | Auth | Description            |
|--------|-------------------------------|------|------------------------|
| POST   | `/api/auth/register`          | ✗    | Create account         |
| POST   | `/api/auth/login`             | ✗    | Sign in, get JWT       |
| GET    | `/api/profile/{user_id}`      | ✓    | Get personal details   |
| POST   | `/api/profile/{user_id}`      | ✓    | Save personal details  |
| POST   | `/api/health-logs/{user_id}`  | ✓    | Save daily health log  |
| GET    | `/api/health-logs/{user_id}`  | ✓    | Get all health logs    |

---

## Security Notes

- Supabase keys live **only** in `backend/.env` — never in the frontend
- JWT tokens are stored **in React context memory** — never in localStorage
- Passwords are hashed with **bcrypt** before being stored
- Each API route validates that the JWT user matches the requested `user_id`
