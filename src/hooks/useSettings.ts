import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, CompanySettings } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: Partial<CompanySettings>) => settingsApi.update(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: 'Settings saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    },
  });
}
