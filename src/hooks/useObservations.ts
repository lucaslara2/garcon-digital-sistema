
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export const useObservations = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['observations', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_observations')
        .select(`
          *,
          product_observation_assignments(
            products(name)
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });
};

export const useCreateObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (observationData: any) => {
      const { error } = await supabase
        .from('product_observations')
        .insert(observationData);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Observação criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar observação: ' + error.message);
    }
  });
};

export const useUpdateObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...observationData }: any) => {
      const { error } = await supabase
        .from('product_observations')
        .update(observationData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Observação atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar observação: ' + error.message);
    }
  });
};

export const useDeleteObservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (observationId: string) => {
      const { error } = await supabase
        .from('product_observations')
        .delete()
        .eq('id', observationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Observação excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir observação: ' + error.message);
    }
  });
};
