import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface Translation {
  id: string;
  key: string;
  category: string;
  description?: string;
  translations: {
    [languageCode: string]: {
      value: string;
      updatedAt: string;
      updatedBy: string;
    };
  };
}

export function useTranslations() {
  return useQuery<Translation[]>({
    queryKey: ['translations'],
    queryFn: () => apiClient('/api/translations'),
  });
}

export function useUpdateTranslation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      keyId, 
      languageCode, 
      value 
    }: { 
      keyId: string;
      languageCode: string;
      value: string;
    }) => {
      return apiClient(`/api/translations/${keyId}`, {
        method: 'PATCH',
        body: JSON.stringify({ languageCode, value }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations'] });
    },
  });
}

export function useLanguages() {
  return useQuery<string[]>({
    queryKey: ['languages'],
    queryFn: () => apiClient('/api/languages'),
  });
}