from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from typing import List, Dict, Optional
from src.localization_management_api.deps import get_supabase
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/")
async def get_translation_keys(supabase: Client = Depends(get_supabase)):
    """
    Fetch all translation keys with their translations
    """
    try:
        # First, get all translation keys with their categories and descriptions
        keys_result = (
            supabase
            .table("translation_keys")
            .select("*")
            .execute()
        )
        
        if not keys_result.data:
            return []
            
        # Get all translations
        translations_result = (
            supabase
            .table("translations")
            .select("*")
            .execute()
        )
        
        # Get all languages
        languages_result = (
            supabase
            .table("languages")
            .select("*")
            .eq("is_active", True)
            .execute()
        )
        
        # Create a mapping of language codes to language names
        languages = {lang["code"]: lang["name"] for lang in languages_result.data}
        
        # Group translations by key_id and language_code
        translations_by_key = {}
        for trans in translations_result.data:
            key_id = trans["key_id"]
            if key_id not in translations_by_key:
                translations_by_key[key_id] = {}
            translations_by_key[key_id][trans["language_code"]] = {
                "value": trans["value"],
                "updated_at": trans["updated_at"]
            }
        
        # Build the response
        result = []
        for key in keys_result.data:
            key_id = key["id"]
            translations = translations_by_key.get(key_id, {})
            
            # Ensure all active languages are included, even if no translation exists
            for lang_code in languages:
                if lang_code not in translations:
                    translations[lang_code] = {
                        "value": "",
                        "updated_at": None
                    }
            
            result.append({
                "id": key_id,
                "key": key["key"],
                "category": key["category"],
                "description": key.get("description"),
                "created_at": key["created_at"],
                "updated_at": key["updated_at"],
                "translations": {
                    lang_code: {
                        "value": trans["value"],
                        "updated_at": trans["updated_at"]
                    }
                    for lang_code, trans in translations.items()
                }
            })
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching translations: {str(e)}"
        )

@router.patch("/{key_id}")
async def update_translation(
    key_id: str,
    lang: str,
    value: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Update a translation for a specific key and language
    """
    try:
        # Check if the key exists
        key_result = (
            supabase
            .table("translation_keys")
            .select("id")
            .eq("id", key_id)
            .execute()
        )
        
        if not key_result.data:
            raise HTTPException(status_code=404, detail="Translation key not found")
        
        # Check if the language exists and is active
        lang_result = (
            supabase
            .table("languages")
            .select("code")
            .eq("code", lang)
            .eq("is_active", True)
            .execute()
        )
        
        if not lang_result.data:
            raise HTTPException(status_code=400, detail="Invalid or inactive language code")
        
        # Update or insert the translation
        update_result = (
            supabase
            .table("translations")
            .upsert(
                {
                    "key_id": key_id,
                    "language_code": lang,
                    "value": value
                },
                on_conflict="key_id,language_code"
            )
            .execute()
        )
        
        return {"status": "success", "message": "Translation updated successfully"}
    except Exception as e:
        logger.exception("Error updating translation")
        raise HTTPException(status_code=500, detail=f"Error updating translation: {str(e)}")
