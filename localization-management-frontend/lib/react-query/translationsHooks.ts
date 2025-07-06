import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api';
import type { TranslationKey } from '@/lib/types';
import { useAuthStore } from '@/lib/zustand-stores/profileStore';

export function useAllTranslationKeys() {
  const session = useAuthStore((s) => s.session)

  return useQuery<TranslationKey[], Error>({
    queryKey: ['allTranslationKeys'],
    queryFn: async () => {
      if (!session?.access_token) throw new Error('Not authenticated')
      const { data } = await API.get<TranslationKey[]>('/localizations', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      return data
    },
    enabled: Boolean(session?.access_token),
    retry: false,
  })
}

type UpdatePayload = {
  id: string
  lang: string
  value: string
}

export function useUpdateTranslation() {
  const session = useAuthStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation<void, Error, UpdatePayload>({
    mutationFn: async ({ id, lang, value }) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }
      await API.patch(
        `/localizations/${id}?lang=${lang}&value=${encodeURIComponent(value)}`, null, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )
    },
    onSuccess: () => {
      // invalidate the same key you used in useAllTranslationKeys
      queryClient.invalidateQueries({ queryKey: ['allTranslationKeys'] })
    },
  })
}
