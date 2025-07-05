from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.localization_management_api.core.config import settings
from src.localization_management_api.routers import localizations, analytics

app = FastAPI(
    title="Localization Management API",
    version="1.0.0",
    root_path="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(localizations.router, prefix="/localizations", tags=["localizations"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {"message": "Localization Management API is running"}

# Handle 404 for API routes
@app.exception_handler(404)
async def not_found_exception_handler(request: Request, exc: Exception):
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            status_code=404,
            content={"detail": "API endpoint not found"}
        )
    return await request.app.default_exception_handler(request, exc)