import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export const useCategories = (restaurantId?: string | null) => {
  const { userProfile } = useAuth();
  
  // Use the provided restaurantId or fall back to user's restaurant_id
  const effectiveRestaurantId = restaurantId || userProfile?.restaurant_id;

  return useQuery({
    queryKey: ['categories', effectiveRestaurantId],
    queryFn: async () => {
      if (!effectiveRestaurantId) {
        return [];
      }

      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          products(count)
        `)
        .eq('restaurant_id', effectiveRestaurantId)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveRestaurantId
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: any) => {
      const { error } = await supabase
        .from('product_categories')
        .insert(categoryData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...categoryData }: any) => {
      const { error } = await supabase
        .from('product_categories')
        .update(categoryData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar categoria: ' + error.message);
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir categoria: ' + error.message);
    }
  });
};
