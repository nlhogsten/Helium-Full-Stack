from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from src.localization_management_api.deps import get_supabase
from typing import Dict

router = APIRouter()

@router.get("/{project_id}/{locale}")
async def read_localizations(
    project_id: str,
    locale: str,
    supabase: Client = Depends(get_supabase),
):
    # Assuming you have a table named `localizations` with columns
    # (project_id: text, locale: text, key: text, value: text)
    res = (
        supabase
        .table("localizations")
        .select("key,value")
        .eq("project_id", project_id)
        .eq("locale", locale)
        .execute()
    )
    if res.error:
        raise HTTPException(500, res.error.message)

    # transform list of { key, value } into a dict
    data: Dict[str, str] = { row["key"]: row["value"] for row in res.data }
    return { "project_id": project_id, "locale": locale, "localizations": data }
