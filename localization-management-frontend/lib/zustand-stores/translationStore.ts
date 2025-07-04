import { create } from 'zustand';
import type { TranslationKey } from '@/lib/types';

interface TranslationState {
  translationKeys: TranslationKey[];
  setTranslationKeys: (keys: TranslationKey[]) => void;
  updateTranslation: (keyId: string, lang: string, value: string) => void;
}

export const useTranslationStore = create<TranslationState>((set) => ({
  translationKeys: [],
  setTranslationKeys: (keys) => set({ translationKeys: keys }),
  updateTranslation: (keyId, lang, value) => 
    set((state) => ({
      translationKeys: state.translationKeys.map((key) => {
        if (key.id === keyId) {
          return {
            ...key,
            translations: {
              ...key.translations,
              [lang]: {
                ...key.translations[lang],
                value,
              },
            },
          };
        }
        return key;
      }),
    })),
}));
