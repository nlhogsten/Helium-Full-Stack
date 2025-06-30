'use client'

import { useTranslationKeys } from '@/lib/react-query/hooks'
import { TranslationKeyRow } from './TranslationKeyRow'
import { useZustandStore } from '@/lib/zustand-stores/searchStore'
import type { TranslationKey } from '@/lib/types'

export function TranslationKeyManager() {
  const search = useZustandStore((s) => s.search)
  const { data: keys = [], isLoading, error, refetch } = useTranslationKeys({ search })

  if (isLoading) return <p>Loading…</p>
  if (error) return <p className="text-red-500">Error loading keys.</p>

  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th className="p-2 text-left">Key</th>
          <th className="p-2 text-left">Category</th>
          {/* You can dynamically render one <th> per active language */}
        </tr>
      </thead>
      <tbody>
        {keys.map((k: TranslationKey) => (
          <TranslationKeyRow key={k.id} keyObj={k} onSave={refetch} />
        ))}
      </tbody>
    </table>
  )
}
