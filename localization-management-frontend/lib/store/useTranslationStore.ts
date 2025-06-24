import { create } from 'zustand';

interface Translation {
  id: string;
  key: string;
  category: string;
  description?: string;
  translations: {
    [languageCode: string]: {
      value: string;
      updatedAt: string;
      updatedBy: string;
    };
  };
}

interface TranslationState {
  searchQuery: string;
  selectedCategory: string | null;
  translations: Translation[];
  filteredTranslations: Translation[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setTranslations: (translations: Translation[]) => void;
  updateTranslation: (id: string, language: string, value: string) => void;
}

export const useTranslationStore = create<TranslationState>((set, get) => ({
  searchQuery: '',
  selectedCategory: null,
  translations: [],
  filteredTranslations: [],
  setSearchQuery: (searchQuery) => {
    const { translations, selectedCategory } = get();
    set({
      searchQuery,
      filteredTranslations: filterTranslations(translations, searchQuery, selectedCategory),
    });
  },
  setSelectedCategory: (selectedCategory) => {
    const { translations, searchQuery } = get();
    set({
      selectedCategory,
      filteredTranslations: filterTranslations(translations, searchQuery, selectedCategory),
    });
  },
  setTranslations: (translations) => {
    const { searchQuery, selectedCategory } = get();
    set({
      translations,
      filteredTranslations: filterTranslations(translations, searchQuery, selectedCategory),
    });
  },
  updateTranslation: (id, language, value) => {
    const { translations } = get();
    const updated = translations.map((t) =>
      t.id === id
        ? {
            ...t,
            translations: {
              ...t.translations,
              [language]: {
                ...t.translations[language],
                value,
                updatedAt: new Date().toISOString(),
              },
            },
          }
        : t
    );
    set({ translations: updated });
  },
}));

function filterTranslations(
  translations: Translation[],
  searchQuery: string,
  category: string | null
) {
  return translations.filter((translation) => {
    const matchesSearch =
      translation.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translation.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !category || translation.category === category;
    return matchesSearch && matchesCategory;
  });
}
