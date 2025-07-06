from typing import Dict
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from ..deps import get_supabase
from ..core.config import settings

router = APIRouter()

@router.get("/translation-completion")
async def get_translation_completion(
    supabase: Client = Depends(get_supabase)
) -> Dict[str, float]:
    """
    Calculate translation completion percentages.
    
    Returns:
        Dict[str, float]: A dictionary with language codes as keys and completion percentages as values
    """
    try:
        # Get all active languages
        languages_response = supabase.table('languages')\
            .select('code')\
            .eq('is_active', True)\
            .execute()
        active_languages = [lang['code'] for lang in languages_response.data]
        total_languages = len(active_languages)
        
        if total_languages == 0:
            return {}
            
        # Get all translation keys
        keys_response = supabase.table('translation_keys').select('id').execute()
        total_keys = len(keys_response.data)
        
        if total_keys == 0:
            return {}
            
        # Get count of non-empty translations per language
        completion_stats = {}
        for lang in active_languages:
            # Count only non-empty translations
            translations_response = supabase.table('translations')\
                .select('value', count='exact')\
                .eq('language_code', lang)\
                .not_.eq('value', '')\
                .not_.is_('value', 'null')\
                .execute()
                
            translated_count = translations_response.count or 0
            completion_percentage = (translated_count / total_keys) * 100 if total_keys > 0 else 0
            completion_stats[lang] = round(completion_percentage, 2)
            
        return completion_stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
