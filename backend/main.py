import os
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import User, Household, Task
from schemas import (
    MagicLinkRequest, MagicLinkVerify, TokenResponse,
    UserResponse, UserUpdate, UserBrief,
    HouseholdCreate, HouseholdJoin, HouseholdResponse,
    TaskCreate, TaskUpdate, TaskResponse,
)
from auth import (
    create_access_token, create_magic_token, get_magic_link_expiry,
    get_current_user,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Shared Tasks API",
    description="Simple shared task management for couples",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow frontend origin
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Auth Routes ==============

@app.post("/api/auth/magic-link", tags=["Auth"])
async def request_magic_link(request: MagicLinkRequest, db: Session = Depends(get_db)):
    """Request a magic link for sign in. Returns the token directly (in production, email this)."""
    email = request.email.lower()
    
    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email)
        db.add(user)
    
    # Generate magic token
    token = create_magic_token()
    user.magic_token = token
    user.magic_token_expires = get_magic_link_expiry()
    db.commit()
    
    # In production, you'd email this link. For now, return it directly.
    # TODO: Integrate with email service (SendGrid, Resend, etc.)
    magic_link = f"{FRONTEND_URL}?token={token}"
    
    return {
        "message": "Magic link created",
        "magic_link": magic_link,  # Remove this in production!
        "token": token,  # Remove this in production!
    }


@app.post("/api/auth/verify", response_model=TokenResponse, tags=["Auth"])
async def verify_magic_link(request: MagicLinkVerify, db: Session = Depends(get_db)):
    """Verify a magic link token and return an access token."""
    user = db.query(User).filter(User.magic_token == request.token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    if user.magic_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
    
    # Clear the magic token
    user.magic_token = None
    user.magic_token_expires = None
    db.commit()
    
    # Create access token
    access_token = create_access_token(user.id)
    return TokenResponse(access_token=access_token)


@app.post("/api/auth/logout", tags=["Auth"])
async def logout(current_user: User = Depends(get_current_user)):
    """Logout (client should discard token)."""
    return {"message": "Logged out"}


# ============== User Routes ==============

@app.get("/api/users/me", response_model=UserResponse, tags=["Users"])
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user


@app.patch("/api/users/me", response_model=UserResponse, tags=["Users"])
async def update_me(
    update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user's profile."""
    if update.name is not None:
        current_user.name = update.name
    if update.avatar_color is not None:
        current_user.avatar_color = update.avatar_color
    db.commit()
    db.refresh(current_user)
    return current_user


# ============== Household Routes ==============

@app.post("/api/households", response_model=HouseholdResponse, tags=["Households"])
async def create_household(
    data: HouseholdCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new household and join it."""
    if current_user.household_id:
        raise HTTPException(status_code=400, detail="Already in a household")
    
    household = Household(name=data.name)
    db.add(household)
    db.flush()  # Get the ID
    
    current_user.household_id = household.id
    db.commit()
    db.refresh(household)
    
    return HouseholdResponse(
        id=household.id,
        name=household.name,
        invite_code=household.invite_code,
        created_at=household.created_at,
        members=[UserBrief(id=current_user.id, name=current_user.name, avatar_color=current_user.avatar_color)],
    )


@app.post("/api/households/join", response_model=HouseholdResponse, tags=["Households"])
async def join_household(
    data: HouseholdJoin,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Join an existing household using invite code."""
    if current_user.household_id:
        raise HTTPException(status_code=400, detail="Already in a household")
    
    household = db.query(Household).filter(
        Household.invite_code == data.invite_code.upper()
    ).first()
    
    if not household:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    current_user.household_id = household.id
    db.commit()
    db.refresh(household)
    
    members = [UserBrief(id=m.id, name=m.name, avatar_color=m.avatar_color) for m in household.members]
    
    return HouseholdResponse(
        id=household.id,
        name=household.name,
        invite_code=household.invite_code,
        created_at=household.created_at,
        members=members,
    )


@app.get("/api/households/current", response_model=HouseholdResponse, tags=["Households"])
async def get_current_household(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's household."""
    if not current_user.household_id:
        raise HTTPException(status_code=404, detail="Not in a household")
    
    household = db.query(Household).filter(Household.id == current_user.household_id).first()
    if not household:
        raise HTTPException(status_code=404, detail="Household not found")
    
    members = [UserBrief(id=m.id, name=m.name, avatar_color=m.avatar_color) for m in household.members]
    
    return HouseholdResponse(
        id=household.id,
        name=household.name,
        invite_code=household.invite_code,
        created_at=household.created_at,
        members=members,
    )


@app.post("/api/households/leave", tags=["Households"])
async def leave_household(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Leave the current household."""
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="Not in a household")
    
    current_user.household_id = None
    db.commit()
    return {"message": "Left household"}


# ============== Task Routes ==============

def task_to_response(task: Task) -> TaskResponse:
    """Convert a Task model to TaskResponse."""
    return TaskResponse(
        id=task.id,
        household_id=task.household_id,
        title=task.title,
        claimed_by=task.claimed_by,
        completed_by=task.completed_by,
        completed_at=task.completed_at,
        created_by=task.created_by,
        created_at=task.created_at,
        claimed_by_user=UserBrief(
            id=task.claimed_by_user.id,
            name=task.claimed_by_user.name,
            avatar_color=task.claimed_by_user.avatar_color,
        ) if task.claimed_by_user else None,
        completed_by_user=UserBrief(
            id=task.completed_by_user.id,
            name=task.completed_by_user.name,
            avatar_color=task.completed_by_user.avatar_color,
        ) if task.completed_by_user else None,
        created_by_user=UserBrief(
            id=task.created_by_user.id,
            name=task.created_by_user.name,
            avatar_color=task.created_by_user.avatar_color,
        ) if task.created_by_user else None,
    )


@app.get("/api/tasks", response_model=list[TaskResponse], tags=["Tasks"])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all active (uncompleted) tasks for the household."""
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="Not in a household")
    
    tasks = db.query(Task).filter(
        Task.household_id == current_user.household_id,
        Task.completed_at.is_(None),
    ).order_by(Task.created_at.desc()).all()
    
    return [task_to_response(t) for t in tasks]


@app.get("/api/tasks/completed", response_model=list[TaskResponse], tags=["Tasks"])
async def get_completed_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get completed tasks from the last 7 days."""
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="Not in a household")
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    tasks = db.query(Task).filter(
        Task.household_id == current_user.household_id,
        Task.completed_at.isnot(None),
        Task.completed_at >= seven_days_ago,
    ).order_by(Task.completed_at.desc()).all()
    
    return [task_to_response(t) for t in tasks]


@app.post("/api/tasks", response_model=TaskResponse, tags=["Tasks"])
async def create_task(
    data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new task."""
    if not current_user.household_id:
        raise HTTPException(status_code=400, detail="Not in a household")
    
    task = Task(
        household_id=current_user.household_id,
        title=data.title.strip(),
        created_by=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task_to_response(task)


@app.post("/api/tasks/{task_id}/claim", response_model=TaskResponse, tags=["Tasks"])
async def claim_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Claim a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.household_id == current_user.household_id,
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.claimed_by = current_user.id
    db.commit()
    db.refresh(task)
    
    return task_to_response(task)


@app.post("/api/tasks/{task_id}/unclaim", response_model=TaskResponse, tags=["Tasks"])
async def unclaim_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unclaim a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.household_id == current_user.household_id,
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.claimed_by = None
    db.commit()
    db.refresh(task)
    
    return task_to_response(task)


@app.post("/api/tasks/{task_id}/complete", response_model=TaskResponse, tags=["Tasks"])
async def complete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a task as complete."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.household_id == current_user.household_id,
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.completed_by = current_user.id
    task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    
    return task_to_response(task)


@app.post("/api/tasks/{task_id}/uncomplete", response_model=TaskResponse, tags=["Tasks"])
async def uncomplete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a task as not complete (undo)."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.household_id == current_user.household_id,
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.completed_by = None
    task.completed_at = None
    db.commit()
    db.refresh(task)
    
    return task_to_response(task)


@app.delete("/api/tasks/{task_id}", tags=["Tasks"])
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.household_id == current_user.household_id,
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted"}


# ============== Static Files (Frontend) ==============

# Check multiple possible locations for frontend dist
possible_paths = [
    os.path.join(os.path.dirname(__file__), "dist"),  # backend/dist
    os.path.join(os.path.dirname(__file__), "..", "dist"),  # ../dist (dev)
    "/opt/render/project/src/dist",  # Render default path
]

frontend_dist = None
for path in possible_paths:
    if os.path.exists(path) and os.path.isdir(path):
        frontend_dist = path
        break

if frontend_dist:
    assets_path = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    # Mount other static files (icons, manifest, etc.)
    for static_file in ["favicon.svg", "pwa-192x192.svg", "pwa-512x512.svg", "apple-touch-icon.svg", "manifest.webmanifest", "registerSW.js", "sw.js"]:
        static_path = os.path.join(frontend_dist, static_file)
        if os.path.exists(static_path):
            @app.get(f"/{static_file}")
            async def serve_static(file=static_path):
                return FileResponse(file)
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes."""
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
