'use client';
import { useMemo, useState, useEffect } from 'react';
import { useAllTranslationKeys, useUpdateTranslation } from '@/lib/react-query/translationsHooks';
import { TranslationKeyRow } from './TranslationKeyRow';
import type { TranslationKey } from '@/lib/types';
import { useZustandStore } from '@/lib/zustand-stores/searchStore';
import { useTranslationStore } from '@/lib/zustand-stores/translationStore';

export function TranslationKeyManager() {
  const search = useZustandStore((s) => s.search);
  const { data: allKeys = [], isLoading, error, refetch } = useAllTranslationKeys();
  const [editingCell, setEditingCell] = useState<{keyId: string; lang: string} | null>(null);
  
  // Use the translation store
  const { translationKeys, setTranslationKeys, updateTranslation } = useTranslationStore();
  const updateMutation = useUpdateTranslation();

  // Update local state when API data changes
  useEffect(() => {
    if (allKeys.length > 0) {
      setTranslationKeys(allKeys);
    }
  }, [allKeys, setTranslationKeys]);

  // Cancel any open edit when the search term changes
  useEffect(() => {
    setEditingCell(null);
  }, [search]);

  // Handle saving a translation
  const handleSave = async (keyId: string, lang: string, value: string) => {
    // Optimistically update the UI
    updateTranslation(keyId, lang, value);
    
    try {
      // Update the server
      await updateMutation.mutateAsync({
        id: keyId,
        lang,
        value,
      });
      
      // Refresh the data to ensure consistency
      await refetch();
    } catch (error) {
      // Revert on error
      await refetch();
      throw error;
    }
  };

  // Memoize filtered keys to avoid unnecessary state and effects
  const filteredKeys: TranslationKey[] = useMemo(() => {
    if (!search) return translationKeys;
    const term = search.toLowerCase();

    return translationKeys.filter((key) => {
      if (key.key.toLowerCase().includes(term)) return true;
      if (key.category?.toLowerCase().includes(term)) return true;
      return Object.values(key.translations).some((t) =>
        t.value.toLowerCase().includes(term)
      );
    });
  }, [search, translationKeys]);

  // Get unique languages from the first key (assuming all keys have the same languages)
  const languages = useMemo(() => {
    if (translationKeys.length === 0) return [];
    return Object.keys(translationKeys[0]?.translations || {}).sort();
  }, [translationKeys]);

  if (isLoading && translationKeys.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Loading translations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <p className="text-sm text-red-700">
          Error loading translations. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
        <thead className="bg-stone-50 dark:bg-stone-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Key</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Category</th>
            {languages.map((lang) => (
              <th 
                key={lang} 
                className="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider"
              >
                {lang.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
          {filteredKeys.length > 0 ? (
            filteredKeys.map((keyObj: TranslationKey) => (
              <TranslationKeyRow
                key={keyObj.id}
                keyObj={keyObj}
                onSave={handleSave}
                isEditing={editingCell?.keyId === keyObj.id}
                editingLang={editingCell?.lang}
                onStartEditing={(lang) => setEditingCell({ keyId: keyObj.id, lang })}
                onCancelEditing={() => setEditingCell(null)}
              />
            ))
          ) : (
            <tr>
              <td colSpan={2 + languages.length} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {search
                  ? `No translations found matching "${search}"`
                  : 'No translations available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
