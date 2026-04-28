"""FastAPI entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import auth as auth_router
from .routers import tasks as tasks_router
from .routers import voice as voice_router
from .routers import core as core_router
from .routers import intel as intel_router
from .routers import dashboard as dashboard_router

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="Command Center OS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings().cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router,  prefix="/api/auth",          tags=["auth"])
app.include_router(tasks_router.router, prefix="/api/tasks",         tags=["tasks"])
app.include_router(voice_router.router, prefix="/api/voice",         tags=["voice"])
app.include_router(core_router.router,  prefix="/api",               tags=["core"])
app.include_router(intel_router.router,      prefix="/api",               tags=["intel"])
app.include_router(dashboard_router.router, prefix="/api/dashboard",     tags=["dashboard"])


@app.get("/api/health")
async def health():
    return {"ok": True, "service": "command_os_api", "version": "1.0.0"}


@app.get("/api/")
async def root():
    return {
        "name": "Command Center OS",
        "endpoints": [
            "POST /api/auth/login",
            "GET  /api/auth/me",
            "GET  /api/tasks",
            "POST /api/tasks",
            "PATCH /api/tasks/{id}",
            "POST /api/voice/split",
            "POST /api/voice/approve",
            "GET  /api/businesses",
            "GET  /api/people",
            "GET  /api/projects",
            "GET  /api/leads",
            "GET  /api/revenue",
            "GET  /api/directives",
            "GET  /api/warnings",
            "POST /api/ask-brain",
            "GET  /api/automations",
            "GET  /api/integrations/status",
            "POST /api/integrations/{provider}/connect",
        ],
    }

# Mount frontend static files
static_dir = "/app/static"
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

    # Catch-all for React Router
    @app.exception_handler(404)
    async def custom_404_handler(request, __):
        return FileResponse(os.path.join(static_dir, "index.html"))
