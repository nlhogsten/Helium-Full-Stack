import { create } from 'zustand';

interface UIState {
  search: string
  setSearch: (s: string) => void
}

export const useZustandStore = create<UIState>(set => ({
  search: '',
  setSearch: search => set({ search }),
}))
