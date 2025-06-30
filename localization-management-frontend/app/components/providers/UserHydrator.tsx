'use client';
import { useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { useAuthStore } from '@/lib/zustand-stores/profileStore';

export default function UserHydrator({
  initialUser,
  initialSession,
}: {
  initialUser: User | null
  initialSession: Session | null
}) {
  const setUser = useAuthStore(s => s.setUser)
  const setSession = useAuthStore(s => s.setSession)

  useEffect(() => {
    setUser(initialUser)
    setSession(initialSession)
  }, [initialUser, initialSession, setUser, setSession])

  return null
}
