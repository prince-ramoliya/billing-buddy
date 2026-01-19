import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnsApi, Return } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useReturns() {
  return useQuery({
    queryKey: ['returns'],
    queryFn: returnsApi.getAll,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (returnData: Omit<Return, 'id' | 'created_at' | 'sellers' | 'product_categories'>) =>
      returnsApi.create(returnData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Return logged successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error logging return', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteReturn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => returnsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Return deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting return', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateReturn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, returnData }: { id: string; returnData: Partial<Return> }) =>
      returnsApi.update(id, returnData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Return updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating return', description: error.message, variant: 'destructive' });
    },
  });
}
