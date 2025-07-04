# src/localization_management_api/deps.py
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from src.localization_management_api.core.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)
bearer = HTTPBearer()

def get_supabase(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> Client:
    token = credentials.credentials
    supabase: Client = get_supabase_client()

    supabase.postgrest.auth(token)

    try:
        supabase.auth.get_user(token)
    except Exception as e:
        logger.warning(f"Token validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return supabase
