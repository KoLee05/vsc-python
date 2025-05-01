from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from datetime import datetime

DATABASE_PATH = "./tasknest.db"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Adatbázis inicializálás
def init_db():
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password_hash TEXT,
            created_at TEXT
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS task_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            color TEXT,
            created_at TEXT
        )
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            description TEXT,
            due_date TEXT,
            status TEXT DEFAULT 'todo',
            task_type_id INTEGER,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(task_type_id) REFERENCES task_types(id)
        )
        """)
        conn.commit()

init_db()

# Dependency
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    try:
        yield conn
    finally:
        conn.close()

# Teszt endpoint
@app.get("/")
def root():
    return {"message": "TaskNest backend elindult!"}

# Task type endpoints
@app.get("/task-types")
def read_task_types(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM task_types")
    types = cursor.fetchall()
    return [
        {
            "id": type[0],
            "name": type[1],
            "color": type[2],
            "created_at": type[3],
        }
        for type in types
    ]

@app.post("/task-types")
def create_task_type(task_type: dict, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO task_types (name, color, created_at)
        VALUES (?, ?, ?)
    """, (
        task_type["name"],
        task_type["color"],
        created_at
    ))
    db.commit()
    type_id = cursor.lastrowid
    
    return {
        "id": type_id,
        "name": task_type["name"],
        "color": task_type["color"],
        "created_at": created_at,
    }

@app.delete("/task-types/{type_id}")
def delete_task_type(type_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM task_types WHERE id = ?", (type_id,))
    db.commit()
    return {"message": "Task type deleted successfully"}

# Task lekérés
@app.get("/tasks")
def read_tasks(db: sqlite3.Connection = Depends(get_db)):
    try:
        print("read_tasks endpoint called")  # Add this line
        cursor = db.cursor()
        cursor.execute("""
            SELECT t.*, tt.name as type_name, tt.color as type_color 
            FROM tasks t 
            LEFT JOIN task_types tt ON t.task_type_id = tt.id
        """)
        tasks = cursor.fetchall()
        print(f"Tasks: {tasks}") # Add this line
        return [
            {
                "id": task[0],
                "user_id": task[1],
                "title": task[2],
                "description": task[3],
                "due_date": task[4],
                "status": task[5],
                "task_type_id": task[6],
                "created_at": task[7],
                "updated_at": task[8],
                "type_name": task[9],
                "type_color": task[10]
            }
            for task in tasks
        ]
    except Exception as e:
        print(f"Error in read_tasks: {e}") # Add this line
        raise  # Re-raise the exception

# Task létrehozás
@app.post("/tasks")
def create_task(task: dict, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    created_at = datetime.utcnow().isoformat()
    updated_at = created_at
    
    # Insert the task
    cursor.execute("""
        INSERT INTO tasks (user_id, title, description, due_date, status, task_type_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        1,
        task["title"],
        task.get("description", ""),
        task.get("due_date"),
        "nincs kész",  # Default status
        task.get("task_type_id"),
        created_at,
        updated_at
    ))
    db.commit()
    task_id = cursor.lastrowid
    
    # Fetch the task with type information
    cursor.execute("""
        SELECT t.*, tt.name as type_name, tt.color as type_color 
        FROM tasks t
        LEFT JOIN task_types tt ON t.task_type_id = tt.id
        WHERE t.id = ?
    """, (task_id,))
    
    task_data = cursor.fetchone()
    
    return {
        "id": task_data[0],
        "user_id": task_data[1],
        "title": task_data[2],
        "description": task_data[3],
        "due_date": task_data[4],
        "status": task_data[5],
        "task_type_id": task_data[6],
        "created_at": task_data[7],
        "updated_at": task_data[8],
        "type_name": task_data[9],
        "type_color": task_data[10]
    }

# Task törlés
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return {"message": "Task deleted successfully"}

# Task status update
@app.patch("/tasks/{task_id}/status")
def update_task_status(task_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT status FROM tasks WHERE id = ?", (task_id,))
    result = cursor.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Toggle between states
    current_status = result[0]
    new_status = "kész" if current_status == "nincs kész" else "nincs kész"
    
    cursor.execute("""
        UPDATE tasks 
        SET status = ?, updated_at = ?
        WHERE id = ?
    """, (new_status, datetime.utcnow().isoformat(), task_id))
    db.commit()
    return {"status": new_status}
