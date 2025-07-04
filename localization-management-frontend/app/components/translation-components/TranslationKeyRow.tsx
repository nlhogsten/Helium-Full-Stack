'use client';
import { useState, useEffect } from 'react';
import { useUpdateTranslation } from '@/lib/react-query/translationsHooks';
import type { TranslationKey } from '@/lib/types';
import { Spinner } from '../Spinner';

type TranslationKeyRowProps = {
  keyObj: TranslationKey;
  onSave: () => void;
  isEditing: boolean;
  editingLang?: string;
  onStartEditing: (lang: string) => void;
  onCancelEditing: () => void;
};

export function TranslationKeyRow({
  keyObj,
  onSave,
  isEditing,
  editingLang,
  onStartEditing,
  onCancelEditing,
}: TranslationKeyRowProps) {
  const [draft, setDraft] = useState<string>('');
  const updateMutation = useUpdateTranslation();

  useEffect(() => {
    // Reset draft when editing is cancelled
    if (!isEditing) {
      setDraft('');
    }
  }, [isEditing]);

  const handleStartEditing = (lang: string) => {
    setDraft(keyObj.translations[lang]?.value || '');
    onStartEditing(lang);
  };

  const handleSave = async (lang: string) => {
    await updateMutation.mutateAsync(
      { id: keyObj.id, lang, value: draft }
    );
    onCancelEditing();
    onSave();
  };

  return (
    <tr className="hover:bg-stone-100 dark:hover:bg-stone-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-stone-200">
        {keyObj.key}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
        {keyObj.category}
      </td>
      {Object.entries(keyObj.translations)
        .sort(([langA], [langB]) => langA.localeCompare(langB))
        .map(([lang, { value }]) => {
          const isThisCellEditing = isEditing && editingLang === lang;
          return (
            <td key={lang} className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-300">
              {isThisCellEditing ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave(lang)}
                    onBlur={() => onCancelEditing()}
                    autoFocus
                    className="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-200 shadow-sm focus:border-stone-500 dark:focus:border-stone-400 focus:ring-stone-500 dark:focus:ring-stone-400 sm:text-sm pl-3"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave(lang);
                    }}
                    onMouseDown={(e) => {
                      // Prevent input blur when clicking the save button
                      e.preventDefault();
                    }}
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center justify-center w-16 h-8 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-stone-600 hover:bg-stone-700 dark:bg-stone-500 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 dark:focus:ring-stone-400 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateMutation.isPending ? <Spinner className="h-4 w-4" /> : 'Save'}
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleStartEditing(lang)}
                  className="cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-600 p-1 pl-3 rounded"
                >
                  {value || <span className="text-stone-400 dark:text-stone-500">(empty)</span>}
                </div>
              )}
            </td>
          );
        })}
    </tr>
  );
}
