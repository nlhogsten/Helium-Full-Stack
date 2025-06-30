import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { TranslationKey } from '@/lib/types'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g., http://localhost:8000
})

// Custom query hook to get all translation keys
export function useTranslationKeys({ search }: { search: string }) {
  return useQuery<TranslationKey[], Error>({
    queryKey: ['translationKeys', search],
    queryFn: async () => {
      const { data } = await API.get('/translation-keys', {
        params: { search },
      })
      return data
    },
  })
}

type UpdatePayload = {
  id: string
  lang: string
  value: string
}

export function useUpdateTranslation() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, UpdatePayload>({
    mutationFn: async ({ id, lang, value }) => {
      await API.patch(`/translation-keys/${id}`, { lang, value })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationKeys'] })
    },
  })
}



