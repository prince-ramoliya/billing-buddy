import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      order,
      items,
    }: {
      order: { order_date: string; seller_id: string; notes?: string; total_amount: number };
      items: { category_id: string; quantity: number; price_per_piece: number; subtotal: number }[];
    }) => ordersApi.create(order, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Order created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating order', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Order deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting order', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      orderId,
      order,
      items,
    }: {
      orderId: string;
      order: { order_date: string; seller_id: string; notes?: string; total_amount: number };
      items: { category_id: string; quantity: number; price_per_piece: number; subtotal: number }[];
    }) => ordersApi.update(orderId, order, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-with-items'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Order updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating order', description: error.message, variant: 'destructive' });
    },
  });
}
