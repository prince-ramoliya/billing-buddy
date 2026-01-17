import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellersApi, Seller } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useSellers() {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: sellersApi.getAll,
  });
}

export function useCreateSeller() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (seller: Omit<Seller, 'id' | 'created_at'>) => sellersApi.create(seller),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({ title: 'Seller created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating seller', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSeller() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, seller }: { id: string; seller: Partial<Seller> }) =>
      sellersApi.update(id, seller),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({ title: 'Seller updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating seller', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSeller() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => sellersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({ title: 'Seller deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting seller', description: error.message, variant: 'destructive' });
    },
  });
}
