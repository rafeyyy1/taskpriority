import os
import json
import uuid
import hashlib
import secrets
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from ahp import calculate_ahp_weights

app = FastAPI(title="TaskPriority DSS API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "data/tasks.json"
USERS_FILE = "data/users.json"

# In-memory sessions store mapping token -> user profile dict
ACTIVE_SESSIONS = {}

# Password hashing utilities
def hash_password(password: str, salt: bytes = None) -> str:
    if salt is None:
        salt = secrets.token_bytes(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    try:
        salt_hex, key_hex = stored_password.split(':')
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
        return secrets.compare_digest(key, new_key)
    except Exception:
        return False

# Database file operations
def read_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as f:
        try:
            return json.load(f)
        except Exception:
            return []

def write_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=4)

def read_tasks():
    with open(DATA_FILE, "r") as f:
        try:
            tasks = json.load(f)
        except Exception:
            tasks = []
            
    # Migration: assign legacy tasks without user_id to 'admin'
    migrated = False
    for t in tasks:
        if "user_id" not in t:
            t["user_id"] = "admin"
            migrated = True
    if migrated:
        write_tasks(tasks)
        
    return tasks

def write_tasks(tasks):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=4)

# Ensure data directory and files exist
if not os.path.exists("data"):
    os.makedirs("data")
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)
if not os.path.exists(USERS_FILE):
    admin_salt = secrets.token_bytes(16)
    admin_hashed = hash_password("password123", admin_salt)
    default_users = [{
        "id": "admin",
        "username": "admin",
        "password": admin_hashed,
        "name": "Administrator"
    }]
    write_users(default_users)

# Pydantic Schemas
class UserRegister(BaseModel):
    username: str
    password: str
    name: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    name: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class TaskBase(BaseModel):
    nama_tugas: str
    mata_kuliah: str
    deadline: str
    bobot_nilai: int
    tingkat_kesulitan: int
    tipe_tugas: str
    status: str = "Aktif"

class Task(TaskBase):
    id: str
    user_id: str

# Dependency injection for user authentication
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    token = authorization.split(" ")[1]
    if token not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    return ACTIVE_SESSIONS[token]

# User Authentication Routes
@app.post("/register", response_model=UserResponse)
def register(user_data: UserRegister):
    users = read_users()
    # Check if username already exists
    if any(u["username"] == user_data.username for u in users):
        raise HTTPException(status_code=400, detail="Username sudah terdaftar")
        
    hashed_pwd = hash_password(user_data.password)
    new_user = {
        "id": str(uuid.uuid4()),
        "username": user_data.username,
        "password": hashed_pwd,
        "name": user_data.name
    }
    users.append(new_user)
    write_users(users)
    return new_user

@app.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    users = read_users()
    matched_user = next((u for u in users if u["username"] == credentials.username), None)
    
    if not matched_user or not verify_password(matched_user["password"], credentials.password):
        raise HTTPException(status_code=401, detail="Username atau password salah")
        
    token = str(uuid.uuid4())
    user_info = {
        "id": matched_user["id"],
        "username": matched_user["username"],
        "name": matched_user["name"]
    }
    ACTIVE_SESSIONS[token] = user_info
    return {"token": token, "user": user_info}

@app.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token in ACTIVE_SESSIONS:
            del ACTIVE_SESSIONS[token]
    return {"message": "Successfully logged out"}

@app.get("/users/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Task Management Routes (Scope filtered by current authenticated user)
@app.get("/tasks", response_model=List[Task])
def get_tasks(current_user: dict = Depends(get_current_user)):
    all_tasks = read_tasks()
    user_tasks = [t for t in all_tasks if t.get("user_id") == current_user["id"]]
    return user_tasks

@app.post("/tasks", response_model=Task)
def create_task(task: TaskBase, current_user: dict = Depends(get_current_user)):
    tasks = read_tasks()
    new_task = task.dict()
    new_task["id"] = str(uuid.uuid4())
    new_task["user_id"] = current_user["id"]
    tasks.append(new_task)
    write_tasks(tasks)
    return new_task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskBase, current_user: dict = Depends(get_current_user)):
    tasks = read_tasks()
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            if t.get("user_id") != current_user["id"]:
                raise HTTPException(status_code=403, detail="Not authorized to access this task")
            updated_task = task.dict()
            updated_task["id"] = task_id
            updated_task["user_id"] = current_user["id"]
            tasks[i] = updated_task
            write_tasks(tasks)
            return updated_task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    tasks = read_tasks()
    for t in tasks:
        if t["id"] == task_id:
            if t.get("user_id") != current_user["id"]:
                raise HTTPException(status_code=403, detail="Not authorized to access this task")
            
            initial_len = len(tasks)
            tasks = [item for item in tasks if item["id"] != task_id]
            write_tasks(tasks)
            return {"message": "Task deleted"}
            
    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")
    
    try:
        df = pd.read_excel(file.file)
        required_cols = ["Nama Tugas", "Mata Kuliah", "Deadline", "Bobot Nilai", "Kesulitan", "Tipe"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing column: {col}")
        
        tasks = read_tasks()
        imported_count = 0
        
        for index, row in df.iterrows():
            dl = row["Deadline"]
            if isinstance(dl, pd.Timestamp):
                dl_str = dl.strftime("%Y-%m-%d")
            else:
                dl_str = str(dl).split(" ")[0]
                
            new_task = {
                "id": str(uuid.uuid4()),
                "user_id": current_user["id"],
                "nama_tugas": str(row["Nama Tugas"]),
                "mata_kuliah": str(row["Mata Kuliah"]),
                "deadline": dl_str,
                "bobot_nilai": int(row["Bobot Nilai"]),
                "tingkat_kesulitan": int(row["Kesulitan"]),
                "tipe_tugas": str(row["Tipe"]),
                "status": "Aktif"
            }
            tasks.append(new_task)
            imported_count += 1
            
        write_tasks(tasks)
        return {"message": f"Successfully imported {imported_count} tasks"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ahp-settings")
def get_ahp_settings(current_user: dict = Depends(get_current_user)):
    # Simple static weights setup
    return calculate_ahp_weights()

@app.get("/priority")
def get_priority(current_user: dict = Depends(get_current_user)):
    tasks = read_tasks()
    # Filter active tasks for the current user
    active_tasks = [t for t in tasks if t["status"] == "Aktif" and t.get("user_id") == current_user["id"]]
    
    results = []
    today = datetime.now().date()
    
    for t in active_tasks:
        try:
            dl_date = datetime.strptime(t["deadline"], "%Y-%m-%d").date()
            days_diff = (dl_date - today).days
        except:
            days_diff = 7
            
        dl_score = max(0, (30 - max(0, days_diff))) / 30 * 100
        bobot_score = t["bobot_nilai"]
        kesulitan_score = (t["tingkat_kesulitan"] / 5) * 100
        tipe = str(t["tipe_tugas"]).lower()
        tipe_score = 100 if "individu" in tipe else 50
        
        priority_score = (dl_score * 0.35) + (bobot_score * 0.30) + (kesulitan_score * 0.20) + (tipe_score * 0.15)
        
        status = "Low"
        if priority_score >= 80:
            status = "Critical"
        elif priority_score >= 60:
            status = "High"
        elif priority_score >= 40:
            status = "Medium"
            
        results.append({
            "task": t,
            "priority_score": round(priority_score, 2),
            "priority_status": status
        })
        
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    
    for i, res in enumerate(results):
        res["rank"] = i + 1
        
    return results

@app.get("/dashboard-stats")
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    tasks = read_tasks()
    user_tasks = [t for t in tasks if t.get("user_id") == current_user["id"]]
    
    active = [t for t in user_tasks if t["status"] == "Aktif"]
    completed = [t for t in user_tasks if t["status"] == "Selesai"]
    
    today = datetime.now().date()
    deadline_this_week = 0
    for t in active:
        try:
            dl_date = datetime.strptime(t["deadline"], "%Y-%m-%d").date()
            if 0 <= (dl_date - today).days <= 7:
                deadline_this_week += 1
        except:
            pass
            
    return {
        "total_active": len(active),
        "total_completed": len(completed),
        "deadline_this_week": deadline_this_week
    }

