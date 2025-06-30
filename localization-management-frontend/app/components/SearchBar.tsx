'use client';
import { ChangeEvent } from 'react'
import { useZustandStore } from '@/lib/zustand-stores/searchStore'

export function SearchBar() {
  const search = useZustandStore((s) => s.search)
  const setSearch = useZustandStore((s) => s.setSearch)

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
  }

  return (
    <input
      type="search"
      placeholder="Search keys…"
      value={search}
      onChange={onChange}
      className="w-full px-4 py-2 bg-white dark:bg-stone-700 border border-gray-200 dark:border-stone-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-stone-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-stone-400 focus:border-transparent transition-colors duration-200"
    />
  )
}
