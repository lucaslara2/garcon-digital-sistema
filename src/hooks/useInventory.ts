
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export const useInventory = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['inventory', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products(name, price, image_url)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('last_updated', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      inventoryId, 
      newStock, 
      movementType, 
      quantity, 
      reason 
    }: {
      inventoryId: string;
      newStock: number;
      movementType: 'in' | 'out';
      quantity: number;
      reason: string;
    }) => {
      // Atualizar estoque
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          current_stock: newStock,
          last_updated: new Date().toISOString()
        })
        .eq('id', inventoryId);
      
      if (updateError) throw updateError;

      // Registrar movimentação
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          inventory_id: inventoryId,
          movement_type: movementType,
          quantity: movementType === 'in' ? quantity : -quantity,
          reason,
          user_id: userProfile?.id
        });
      
      if (movementError) throw movementError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Estoque ajustado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao ajustar estoque: ' + error.message);
    }
  });
};

export const useStockMovements = (inventoryId?: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['stock-movements', userProfile?.restaurant_id, inventoryId],
    queryFn: async () => {
      if (inventoryId) {
        // Query específica para um item do inventário
        const { data, error } = await supabase
          .from('stock_movements')
          .select(`
            *,
            inventory(
              products(name)
            )
          `)
          .eq('inventory_id', inventoryId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        return data;
      } else {
        // Query para todos os movimentos do restaurante
        // Primeiro buscar todos os IDs do inventário do restaurante
        const { data: inventoryIds, error: inventoryError } = await supabase
          .from('inventory')
          .select('id')
          .eq('restaurant_id', userProfile?.restaurant_id);

        if (inventoryError) throw inventoryError;

        if (!inventoryIds || inventoryIds.length === 0) {
          return [];
        }

        // Agora buscar os movimentos usando os IDs encontrados
        const ids = inventoryIds.map(inv => inv.id);
        
        const { data, error } = await supabase
          .from('stock_movements')
          .select(`
            *,
            inventory(
              products(name)
            )
          `)
          .in('inventory_id', ids)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (error) throw error;
        return data;
      }
    },
    enabled: !!userProfile?.restaurant_id
  });
};
