import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, ProductCategory } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (category: Omit<ProductCategory, 'id'>) => categoriesApi.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating category', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<ProductCategory> }) =>
      categoriesApi.update(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating category', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    },
  });
}
