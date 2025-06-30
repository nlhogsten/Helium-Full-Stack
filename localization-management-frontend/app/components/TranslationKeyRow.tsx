// components/TranslationKeyRow.tsx
'use client'

import { useState } from 'react'
import { useUpdateTranslation } from '@/lib/react-query/hooks'
import type { TranslationKey } from '@/lib/types'

export function TranslationKeyRow({
  keyObj,
  onSave,
}: {
  keyObj: TranslationKey
  onSave: () => void
}) {
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(keyObj.translations).map(([lang, t]) => [lang, t.value])
    )
  )
  const updateMutation = useUpdateTranslation()

  return (
    <tr>
      <td className="p-2">{keyObj.key}</td>
      <td className="p-2">{keyObj.category}</td>

      {Object.entries(keyObj.translations).map(([lang, { value }]) => (
        <td key={lang} className="p-2">
          {editing[lang] ? (
            <input
              value={drafts[lang]}
              onChange={(e) =>
                setDrafts((d) => ({ ...d, [lang]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateMutation.mutate(
                    { id: keyObj.id, lang, value: drafts[lang] },
                    {
                      onSuccess: () => {
                        setEditing((m) => ({ ...m, [lang]: false }))
                        onSave()
                      },
                    }
                  )
                }
              }}
              className="border p-1 rounded w-full"
            />
          ) : (
            <div
              onClick={() =>
                setEditing((m) => ({ ...m, [lang]: true }))
              }
              className="cursor-pointer hover:bg-stone-100 p-1 rounded"
            >
              {value}
            </div>
          )}
        </td>
      ))}
    </tr>
  )
}

