'use client';

import { useTranslationStore } from '@/lib/store/useTranslationStore';
import { useTranslations, useUpdateTranslation, useLanguages } from '@/lib/api/translations';
import { useEffect, useState } from 'react';

export function TranslationKeyManager() {
  const { data: translations, isLoading, error } = useTranslations();
  const { data: languages = [] } = useLanguages();
  const { mutate: updateTranslation } = useUpdateTranslation();

  // Initialize store with translations
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredTranslations,
    setTranslations,
    updateTranslation: updateLocalTranslation
  } = useTranslationStore();

  // Update store when translations change
  useEffect(() => {
    if (translations) {
      setTranslations(translations);
    }
  }, [translations, setTranslations]);

  if (isLoading) return <div>Loading translations...</div>;
  if (error) return <div>Error loading translations</div>;

  const categories = [...new Set(translations?.map(t => t.category) || [])];

  return (
    <div className="p-6">
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search translations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-md border border-stone-300 p-2 dark:bg-stone-700 dark:border-stone-600 dark:text-white"
        />
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="rounded-md border border-stone-300 p-2 dark:bg-stone-700 dark:border-stone-600 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
          <thead className="bg-stone-50 dark:bg-stone-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-300">
                Key
              </th>
              {languages.map(lang => (
                <th key={lang} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-300">
                  {lang.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white dark:bg-stone-800 dark:divide-stone-700">
            {filteredTranslations.map((translation) => (
              <tr key={translation.id} className="hover:bg-stone-50 dark:hover:bg-stone-700">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-stone-900 dark:text-white">
                    {translation.key}
                  </div>
                  {translation.description && (
                    <div className="text-sm text-stone-500 dark:text-stone-400">
                      {translation.description}
                    </div>
                  )}
                </td>
                {languages.map(lang => (
                  <td key={lang} className="whitespace-nowrap px-6 py-4">
                    <input
                      type="text"
                      value={translation.translations[lang]?.value || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateLocalTranslation(translation.id, lang, value);
                        updateTranslation({
                          keyId: translation.id,
                          languageCode: lang,
                          value
                        });
                      }}
                      className="w-full rounded border border-stone-300 p-1 dark:bg-stone-700 dark:border-stone-600 dark:text-white"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}