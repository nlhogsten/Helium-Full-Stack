import { create } from 'zustand';
import {debounce} from 'lodash';

interface UIState {
  rawSearch: string
  search: string
  setRawSearch: (s: string) => void
}

export const useZustandStore = create<UIState>((set) => {
  // debounce the actual `search` update by 450ms
  const debounced = debounce((val: string) => set({ search: val }), 450)
  return {
    rawSearch: '',
    search: '',
    setRawSearch: (raw: string) => {
      set({ rawSearch: raw })
      debounced(raw)
    },
  }
})

