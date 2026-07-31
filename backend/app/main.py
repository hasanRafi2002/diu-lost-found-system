import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import auth, items, categories, claims, notifications, admin, users
from app.middleware import add_security_headers

# Get allowed origins from environment or use default
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(title="DIU Lost & Found API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Security Headers Middleware
app.middleware("http")(add_security_headers)

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(categories.router)
app.include_router(claims.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(users.router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
def health_check():
    return {"status": "ok"}
