from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.localization_management_api.core.config import settings
from src.localization_management_api.routers import auth, localizations

app = FastAPI(
    title="Localization Management API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(localizations.router, prefix="/localizations", tags=["localizations"])
