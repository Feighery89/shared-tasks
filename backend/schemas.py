from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


# --- Auth Schemas ---

class MagicLinkRequest(BaseModel):
    email: EmailStr


class MagicLinkVerify(BaseModel):
    token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- User Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    avatar_color: Optional[str] = "#f97316"


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_color: Optional[str] = None


class UserResponse(UserBase):
    id: str
    household_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserBrief(BaseModel):
    """Minimal user info for embedding in other responses."""
    id: str
    name: Optional[str] = None
    avatar_color: str

    class Config:
        from_attributes = True


# --- Household Schemas ---

class HouseholdCreate(BaseModel):
    name: str


class HouseholdJoin(BaseModel):
    invite_code: str


class HouseholdResponse(BaseModel):
    id: str
    name: str
    invite_code: str
    created_at: datetime
    members: list[UserBrief] = []

    class Config:
        from_attributes = True


# --- Task Schemas ---

class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    claimed_by: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    household_id: str
    title: str
    claimed_by: Optional[str] = None
    completed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_by: str
    created_at: datetime
    claimed_by_user: Optional[UserBrief] = None
    completed_by_user: Optional[UserBrief] = None
    created_by_user: Optional[UserBrief] = None

    class Config:
        from_attributes = True
