

from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import bcrypt
from jose import JWTError, jwt
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

# ── config ────────────────────────────────────────────────────────────────────

SUPABASE_URL    = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY    = os.getenv("SUPABASE_KEY", "")
JWT_SECRET      = os.getenv("JWT_SECRET", "change-this-secret")
JWT_ALGORITHM   = os.getenv("JWT_ALGORITHM", "HS256")
TOKEN_EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer  = HTTPBearer()

app = FastAPI(title="VitalTrack API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # restrict to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── helpers ───────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MIN)
    return jwt.encode({"sub": user_id, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        uid: str = payload.get("sub")
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid token")
        return uid
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    return decode_token(creds.credentials)

# ── schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str

class ProfileRequest(BaseModel):
    full_name: str
    age: int
    gender: str
    weight: float
    height: float
    health_goal: str

class HealthLogRequest(BaseModel):
    water_intake: float
    exercise_minutes: int
    sleep_hours: float
    mood: str
    calories: int
    steps: int

# ── auth routes ───────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    # check if email already exists
    existing = supabase.table("users").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(body.password)
    result = supabase.table("users").insert({
        "email":         body.email,
        "password_hash": hashed,
        "full_name":     body.full_name,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = result.data[0]
    token = create_token(user["id"])
    return AuthResponse(access_token=token, user_id=user["id"], full_name=user["full_name"])


@app.post("/api/auth/login", response_model=AuthResponse)
def login(body: LoginRequest):
    result = supabase.table("users").select("*").eq("email", body.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = result.data[0]
    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"])
    return AuthResponse(access_token=token, user_id=user["id"], full_name=user["full_name"])

# ── profile routes ────────────────────────────────────────────────────────────

@app.get("/api/profile/{user_id}")
def get_profile(user_id: str, current_user: str = Depends(get_current_user)):
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = supabase.table("personal_details").select("*").eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data[0]


@app.post("/api/profile/{user_id}")
def save_profile(user_id: str, body: ProfileRequest, current_user: str = Depends(get_current_user)):
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    payload = {
        "user_id":     user_id,
        "full_name":   body.full_name,
        "age":         body.age,
        "gender":      body.gender,
        "weight":      body.weight,
        "height":      body.height,
        "health_goal": body.health_goal,
        "updated_at":  datetime.utcnow().isoformat(),
    }

    existing = supabase.table("personal_details").select("id").eq("user_id", user_id).execute()
    if existing.data:
        result = supabase.table("personal_details").update(payload).eq("user_id", user_id).execute()
    else:
        result = supabase.table("personal_details").insert(payload).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save profile")
    return result.data[0]

# ── health log routes ─────────────────────────────────────────────────────────

@app.post("/api/health-logs/{user_id}", status_code=status.HTTP_201_CREATED)
def save_health_log(user_id: str, body: HealthLogRequest, current_user: str = Depends(get_current_user)):
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = supabase.table("health_logs").insert({
        "user_id":          user_id,
        "water_intake":     body.water_intake,
        "exercise_minutes": body.exercise_minutes,
        "sleep_hours":      body.sleep_hours,
        "mood":             body.mood,
        "calories":         body.calories,
        "steps":            body.steps,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save health log")
    return result.data[0]


@app.get("/api/health-logs/{user_id}")
def get_health_logs(user_id: str, current_user: str = Depends(get_current_user)):
    if current_user != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = (
        supabase.table("health_logs")
        .select("*")
        .eq("user_id", user_id)
        .order("logged_at", desc=False)
        .execute()
    )
    return result.data or []


@app.get("/")
def health_check():
    return {"status": "VitalTrack API is running"}
