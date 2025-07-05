import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import API from '../api';
import { useAuthStore } from '@/lib/zustand-stores/profileStore';

export type TranslationCompletion = Record<string, number>;

export function useTranslationCompletion() {
  const session = useAuthStore((s) => s.session);

  return useQuery<TranslationCompletion>({
    queryKey: ['translationCompletion'],
    queryFn: async () => {
      if (!session?.access_token) throw new Error('Not authenticated');
      const { data } = await API.get('/analytics/translation-completion', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      return data;
    },
    enabled: Boolean(session?.access_token),
    retry: false,
  });
}

export function useRefreshTranslationCompletion() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['translationCompletion'] });
  }, [queryClient]);
}
