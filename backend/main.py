import os
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from ahp import calculate_ahp_weights

app = FastAPI(title="TaskPriority DSS API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

DATA_FILE = "data/tasks.json"

# Ensure data file exists
if not os.path.exists("data"):
    os.makedirs("data")
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)

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

def read_tasks():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_tasks(tasks):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=4)

@app.get("/tasks", response_model=List[Task])
def get_tasks():
    return read_tasks()

@app.post("/tasks", response_model=Task)
def create_task(task: TaskBase):
    tasks = read_tasks()
    new_task = task.dict()
    new_task["id"] = str(uuid.uuid4())
    tasks.append(new_task)
    write_tasks(tasks)
    return new_task

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskBase):
    tasks = read_tasks()
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            updated_task = task.dict()
            updated_task["id"] = task_id
            tasks[i] = updated_task
            write_tasks(tasks)
            return updated_task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    tasks = read_tasks()
    initial_len = len(tasks)
    tasks = [t for t in tasks if t["id"] != task_id]
    if len(tasks) == initial_len:
        raise HTTPException(status_code=404, detail="Task not found")
    write_tasks(tasks)
    return {"message": "Task deleted"}

@app.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")
    
    try:
        # Read Excel using pandas
        df = pd.read_excel(file.file)
        # Expected columns: Nama Tugas, Mata Kuliah, Deadline, Bobot Nilai, Kesulitan, Tipe
        
        required_cols = ["Nama Tugas", "Mata Kuliah", "Deadline", "Bobot Nilai", "Kesulitan", "Tipe"]
        for col in required_cols:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing column: {col}")
        
        tasks = read_tasks()
        
        for index, row in df.iterrows():
            # Handle deadline parsing
            dl = row["Deadline"]
            if isinstance(dl, pd.Timestamp):
                dl_str = dl.strftime("%Y-%m-%d")
            else:
                dl_str = str(dl).split(" ")[0] # basic handling
                
            new_task = {
                "id": str(uuid.uuid4()),
                "nama_tugas": str(row["Nama Tugas"]),
                "mata_kuliah": str(row["Mata Kuliah"]),
                "deadline": dl_str,
                "bobot_nilai": int(row["Bobot Nilai"]),
                "tingkat_kesulitan": int(row["Kesulitan"]),
                "tipe_tugas": str(row["Tipe"]),
                "status": "Aktif"
            }
            tasks.append(new_task)
            
        write_tasks(tasks)
        return {"message": f"Successfully imported {len(df)} tasks"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ahp-settings")
def get_ahp_settings():
    return calculate_ahp_weights()

@app.get("/priority")
def get_priority():
    tasks = read_tasks()
    active_tasks = [t for t in tasks if t["status"] == "Aktif"]
    
    # Calculate scores
    results = []
    today = datetime.now().date()
    
    for t in active_tasks:
        try:
            dl_date = datetime.strptime(t["deadline"], "%Y-%m-%d").date()
            days_diff = (dl_date - today).days
        except:
            days_diff = 7 # default 1 week if parse error
            
        # 1. Deadline Score (max 30 days considered)
        # Closer deadline = higher score
        dl_score = max(0, (30 - max(0, days_diff))) / 30 * 100
        
        # 2. Bobot Nilai Score
        bobot_score = t["bobot_nilai"]
        
        # 3. Kesulitan Score (1-5)
        kesulitan_score = (t["tingkat_kesulitan"] / 5) * 100
        
        # 4. Tipe Tugas Score
        tipe = str(t["tipe_tugas"]).lower()
        tipe_score = 100 if "individu" in tipe else 50
        
        # Priority calculation
        priority_score = (dl_score * 0.35) + (bobot_score * 0.30) + (kesulitan_score * 0.20) + (tipe_score * 0.15)
        
        # Determine status
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
        
    # Sort by priority score descending
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    
    # Add rank
    for i, res in enumerate(results):
        res["rank"] = i + 1
        
    return results

@app.get("/dashboard-stats")
def get_dashboard_stats():
    tasks = read_tasks()
    active = [t for t in tasks if t["status"] == "Aktif"]
    completed = [t for t in tasks if t["status"] == "Selesai"]
    
    # Deadline this week
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
