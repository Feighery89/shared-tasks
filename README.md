# Shared Tasks

Simple shared task management for couples. No projects, no priorities, no labels. Just tasks, a shared list, and visibility into what's getting done.

## Features

- **Shared Task List** - Add tasks with one tap, claim tasks, mark them done
- **Done Feed** - See what's been completed and by whom (last 7 days)
- **Partner Pairing** - Simple invite code to connect households
- **PWA Support** - Add to home screen for app-like experience

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy
- **Database**: PostgreSQL (or SQLite for local dev)
- **Hosting**: Render

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+

### 1. Clone and Install Frontend

```bash
cd shared-tasks
npm install
```

### 2. Set Up Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run Development Servers

In one terminal, start the backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

In another terminal, start the frontend:
```bash
npm run dev
```

Or run both together:
```bash
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173)

## Deployment to Render

### Option 1: Blueprint (Recommended)

1. Push to GitHub
2. In Render, click "New" > "Blueprint"
3. Connect your repo
4. Render will auto-detect `render.yaml` and set everything up

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - New > PostgreSQL
   - Note the Internal Database URL

2. **Create Web Service**
   - New > Web Service
   - Connect your repo
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables:
     - `DATABASE_URL`: (from PostgreSQL internal URL)
     - `SECRET_KEY`: (generate a random string)
     - `FRONTEND_URL`: `https://your-service.onrender.com`

3. **Build and Deploy Frontend**
   
   Build locally:
   ```bash
   npm run build
   ```
   
   Copy `dist/` contents to `backend/` or serve via CDN.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/magic-link` | Request magic link |
| POST | `/api/auth/verify` | Verify token, get JWT |
| GET | `/api/users/me` | Get current user |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/households` | Create household |
| POST | `/api/households/join` | Join with invite code |
| GET | `/api/households/current` | Get household info |
| GET | `/api/tasks` | Get active tasks |
| GET | `/api/tasks/completed` | Get done tasks (7 days) |
| POST | `/api/tasks` | Create task |
| POST | `/api/tasks/{id}/claim` | Claim task |
| POST | `/api/tasks/{id}/complete` | Complete task |
| DELETE | `/api/tasks/{id}` | Delete task |

## How It Works

### Authentication

Uses magic links - no passwords needed. Users enter their email and click a link to sign in. In dev mode, the link is shown directly; in production, you'd integrate an email service.

### Household Pairing

1. First user creates a household (gets a 6-character invite code)
2. Second user signs up and enters the invite code
3. Both users now share the same task list

### Task Flow

1. **Add** - Anyone can add tasks (they start "unclaimed")
2. **Claim** - Tap to claim a task (shows it's yours)
3. **Complete** - Swipe right (mobile) or click checkmark (desktop)
4. **Done Feed** - Completed tasks show who did them

### Sync

The frontend polls the API every 5 seconds for updates. Changes appear within a few seconds for both partners.

## License

MIT
