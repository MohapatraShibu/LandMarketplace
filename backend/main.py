from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import sqlite3
import hashlib
import jwt
import datetime
import os
import json
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LandConnect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "landconnect_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

security = HTTPBearer()
DB_PATH = os.path.join(os.path.dirname(__file__), "landconnect.db")

# Database helpers

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        created_at TEXT NOT NULL
    )""")
    c.execute("""CREATE TABLE IF NOT EXISTS listings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        location TEXT,
        latitude REAL,
        longitude REAL,
        image_url TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(seller_id) REFERENCES users(id)
    )""")
    c.execute("""CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(sender_id) REFERENCES users(id),
        FOREIGN KEY(receiver_id) REFERENCES users(id)
    )""")
    conn.commit()
    conn.close()

init_db()

# Models

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class MessageCreate(BaseModel):
    receiver_id: int
    content: Optional[str] = None

# Auth helpers

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Auth routes

@app.post("/auth/register")
def register(user: UserRegister):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    c.execute("SELECT id FROM users WHERE username = ?", (user.username,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already taken")
    if user.role not in ("buyer", "seller", "broker"):
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid role")
    now = datetime.datetime.utcnow().isoformat()
    c.execute(
        "INSERT INTO users (username, email, password_hash, role, phone, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (user.username, user.email, hash_password(user.password), user.role, user.phone, now)
    )
    conn.commit()
    user_id = c.lastrowid
    conn.close()
    token = create_access_token({"sub": user.email, "role": user.role, "user_id": user_id})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user_id, "username": user.username, "email": user.email, "role": user.role}}

@app.post("/auth/login")
def login(user: UserLogin):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    row = c.fetchone()
    conn.close()
    if row is None or row["password_hash"] != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": row["email"], "role": row["role"], "user_id": row["id"]})
    return {"access_token": token, "token_type": "bearer", "user": {"id": row["id"], "username": row["username"], "email": row["email"], "role": row["role"]}}

@app.get("/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user

# Listing routes

@app.get("/listings")
def list_listings():
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT l.*, u.username as seller_name FROM listings l JOIN users u ON l.seller_id = u.id ORDER BY l.created_at DESC""")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/listings")
def create_listing(listing: ListingCreate, current_user: dict = Depends(require_role(["seller", "broker"]))):
    conn = get_db()
    c = conn.cursor()
    now = datetime.datetime.utcnow().isoformat()
    c.execute(
        "INSERT INTO listings (seller_id, title, description, price, location, latitude, longitude, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (current_user["id"], listing.title, listing.description, listing.price, listing.location, listing.latitude, listing.longitude, None, now)
    )
    conn.commit()
    listing_id = c.lastrowid
    conn.close()
    return {"id": listing_id, "message": "Listing created"}

@app.put("/listings/{listing_id}")
def update_listing(listing_id: int, listing: ListingCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT seller_id FROM listings WHERE id = ?", (listing_id,))
    row = c.fetchone()
    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Listing not found")
    if row["seller_id"] != current_user["id"] and current_user["role"] not in ("broker",):
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed to edit this listing")
    c.execute(
        "UPDATE listings SET title = ?, description = ?, price = ?, location = ?, latitude = ?, longitude = ? WHERE id = ?",
        (listing.title, listing.description, listing.price, listing.location, listing.latitude, listing.longitude, listing_id)
    )
    conn.commit()
    conn.close()
    return {"message": "Listing updated"}

@app.delete("/listings/{listing_id}")
def delete_listing(listing_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT seller_id FROM listings WHERE id = ?", (listing_id,))
    row = c.fetchone()
    if row is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Listing not found")
    if row["seller_id"] != current_user["id"] and current_user["role"] not in ("broker",):
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed to delete this listing")
    c.execute("DELETE FROM listings WHERE id = ?", (listing_id,))
    conn.commit()
    conn.close()
    return {"message": "Listing deleted"}

# Messaging routes

@app.get("/messages/{user_id}")
def get_messages(user_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    c.execute("""SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC""",
              (current_user["id"], user_id, user_id, current_user["id"]))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/messages")
def send_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    now = datetime.datetime.utcnow().isoformat()
    c.execute(
        "INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?)",
        (current_user["id"], message.receiver_id, message.content, now)
    )
    conn.commit()
    msg_id = c.lastrowid
    conn.close()
    return {"id": msg_id, "message": "Message sent"}

@app.get("/users")
def list_users(current_user: dict = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, username, email, role, phone FROM users WHERE id != ?", (current_user["id"],))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# WebSocket signaling for calls

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, message: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            await ws.send_text(json.dumps(message))

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            target = message.get("target_user_id")
            if target:
                await manager.send_to_user(target, message)
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@app.get("/")
def root():
    return {"message": "LandConnect API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)