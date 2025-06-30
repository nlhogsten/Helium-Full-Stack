import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/lib/zustand-stores/profileStore';
import type { User } from '@supabase/supabase-js';

export function useUser() {
  const user = useAuthStore(s => s.user)
  return useQuery<User | null, Error>({
    queryKey: ['user'],
    queryFn: () => Promise.resolve(user),
    initialData: user,
    enabled: user !== undefined,
    retry: false,
  })
}

export function useSignOut() {
  const qc = useQueryClient()
  const session = useAuthStore(s => s.session)

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!session) throw new Error('No session')

      // call your FastAPI sign‑out endpoint, passing the Bearer token
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signout`,
        {},
        {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }
      )
    },
    onSuccess: () => {
      // clear the store
      qc.setQueryData(['user'], null)
      useAuthStore.getState().setUser(null)
      useAuthStore.getState().setSession(null)
    },
  })
}
