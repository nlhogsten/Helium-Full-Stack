'use client';
import { ChangeEvent } from 'react';
import { useZustandStore } from '@/lib/zustand-stores/searchStore';

export function SearchBar() {
  const rawSearch = useZustandStore((s) => s.rawSearch)
  const setRawSearch = useZustandStore((s) => s.setRawSearch)

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setRawSearch(e.target.value)
  }

  return (
    <input
      type="search"
      placeholder="Search Keys & Categories…"
      value={rawSearch}
      onChange={onChange}
      className="w-full px-4 py-2 bg-white dark:bg-stone-700 border border-gray-200 dark:border-stone-600 rounded-lg shadow-sm placeholder-gray-500 dark:placeholder-stone-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-stone-500 dark:focus:ring-blue-300 focus:border-transparent transition-colors duration-200"
    />
  )
}
