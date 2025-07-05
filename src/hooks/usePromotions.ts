
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export const usePromotions = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['promotions', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_promotions')
        .select(`
          *,
          promotion_products(
            products(name, price, image_url)
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotionData: any) => {
      const { error } = await supabase
        .from('product_promotions')
        .insert(promotionData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promoção criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar promoção: ' + error.message);
    }
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...promotionData }: any) => {
      const { error } = await supabase
        .from('product_promotions')
        .update(promotionData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promoção atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar promoção: ' + error.message);
    }
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotionId: string) => {
      const { error } = await supabase
        .from('product_promotions')
        .delete()
        .eq('id', promotionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promoção excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir promoção: ' + error.message);
    }
  });
};
