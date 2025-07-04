from fastapi import APIRouter, HTTPException, Depends, Header
from supabase import Client
from src.localization_management_api.deps import get_supabase

router = APIRouter()

@router.post("/signin")
async def signin(
    email: str,
    password: str,
    supabase: Client = Depends(get_supabase),
):
    res = supabase.auth.sign_in({ "email": email, "password": password })
    if res.error:
        raise HTTPException(401, res.error.message)
    return { "user": res.user, "session": res.session }

def get_current_user(
    authorization: str = Header(...),
    supabase: Client = Depends(get_supabase),
):
    token = authorization.removeprefix("Bearer ").strip()
    res = supabase.auth.get_user(token)
    if res.error or res.user is None:
        raise HTTPException(401, "Invalid or expired token")
    return res.user

@router.post("/signout")
async def signout(
    authorization: str = Header(...),
    supabase: Client = Depends(get_supabase),
):
    # Supabase-py currently doesn’t have a sign_out endpoint,
    # so you can simply let the client drop the token—
    # or call the REST API directly if needed.
    return { "message": "Sign-out is handled client‑side by dropping the JWT" }
