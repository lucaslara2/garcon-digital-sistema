import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export const useCategories = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['categories', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          products(count)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (categoryData: any) => {
      // Para admins, precisamos especificar o restaurant_id explicitamente
      // Para usuários normais, usar o restaurant_id do perfil
      const dataToInsert = {
        ...categoryData,
        restaurant_id: categoryData.restaurant_id || userProfile?.restaurant_id
      };

      console.log('Creating category with data:', dataToInsert);
      console.log('User profile:', userProfile);

      const { error } = await supabase
        .from('product_categories')
        .insert(dataToInsert);
      
      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error) => {
      console.error('Create category error:', error);
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
