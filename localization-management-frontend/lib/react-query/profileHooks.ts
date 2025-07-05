import { useQuery } from '@tanstack/react-query';
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
