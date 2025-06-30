export interface TranslationRecord {
    value: string
    updatedAt: string
    updatedBy: string | null
  }
  
  export interface TranslationKey {
    id: string
    key: string
    category: string
    description?: string
    translations: Record<string, TranslationRecord>
  }
  
  