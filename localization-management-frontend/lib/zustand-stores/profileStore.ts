import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user:    User | null
  session: Session | null
  setUser:    (u: User|null)    => void
  setSession: (s: Session|null) => void
}

export const useAuthStore = create<AuthState>(set => ({
  user:    null,
  session: null,
  setUser:    user    => set({ user }),
  setSession: session => set({ session }),
}))
