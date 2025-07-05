import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export const useProducts = (selectedCategory?: string, restaurantId?: string | null) => {
  const { userProfile } = useAuth();
  
  // Use the provided restaurantId or fall back to user's restaurant_id
  const effectiveRestaurantId = restaurantId || userProfile?.restaurant_id;

  return useQuery({
    queryKey: ['products', effectiveRestaurantId, selectedCategory],
    queryFn: async () => {
      if (!effectiveRestaurantId) {
        return [];
      }

      let query = supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name),
          inventory(current_stock, min_stock, max_stock),
          product_observation_assignments(
            product_observations(name, description)
          )
        `)
        .eq('restaurant_id', effectiveRestaurantId);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveRestaurantId
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: any) => {
      const { error } = await supabase
        .from('products')
        .insert(productData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar produto: ' + error.message);
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar produto: ' + error.message);
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir produto: ' + error.message);
    }
  });
};
