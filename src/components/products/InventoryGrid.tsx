
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Edit,
  Plus,
  Minus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

const InventoryGrid = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentDialog, setAdjustmentDialog] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const { data: inventory = [] } = useQuery({
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

  const adjustStockMutation = useMutation({
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
      setAdjustmentDialog(false);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      toast.success('Estoque ajustado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao ajustar estoque: ' + error.message);
    }
  });

  const handleStockAdjustment = () => {
    if (!selectedProduct || !adjustmentQuantity || !adjustmentReason) {
      toast.error('Preencha todos os campos');
      return;
    }

    const quantity = parseInt(adjustmentQuantity);
    if (quantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    const currentStock = selectedProduct.current_stock;
    const newStock = adjustmentType === 'in' 
      ? currentStock + quantity
      : Math.max(0, currentStock - quantity);

    adjustStockMutation.mutate({
      inventoryId: selectedProduct.id,
      newStock,
      movementType: adjustmentType,
      quantity,
      reason: adjustmentReason
    });
  };

  const openAdjustmentDialog = (product: any, type: 'in' | 'out') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setAdjustmentDialog(true);
  };

  const getStockStatus = (current: number, min: number, max: number) => {
    if (current <= min) return { status: 'low', color: 'red', text: 'Baixo' };
    if (current >= max * 0.8) return { status: 'high', color: 'blue', text: 'Alto' };
    return { status: 'normal', color: 'green', text: 'Normal' };
  };

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-xl font-medium text-gray-700 mb-2">Nenhum item no estoque</h4>
        <p className="text-gray-500">Os produtos aparecerão aqui automaticamente quando criados</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item, index) => {
          const stockStatus = getStockStatus(item.current_stock, item.min_stock, item.max_stock);
          
          return (
            <Card 
              key={item.id} 
              className="bg-white border-gray-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products?.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.products?.name}</h3>
                        <p className="text-sm text-gray-500">
                          R$ {item.products?.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <Badge 
                      className={`text-xs bg-${stockStatus.color}-100 text-${stockStatus.color}-800 border-${stockStatus.color}-200`}
                    >
                      {stockStatus.text}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estoque Atual:</span>
                      <span className="font-bold text-lg">{item.current_stock}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estoque Mínimo:</span>
                      <span className="text-sm font-medium">{item.min_stock}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estoque Máximo:</span>
                      <span className="text-sm font-medium">{item.max_stock}</span>
                    </div>

                    {item.unit_cost && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Custo Unitário:</span>
                        <span className="text-sm font-medium">R$ {item.unit_cost.toFixed(2)}</span>
                      </div>
                    )}

                    {item.current_stock <= item.min_stock && (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">Estoque baixo!</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAdjustmentDialog(item, 'in')}
                      className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 hover:border-green-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Entrada
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAdjustmentDialog(item, 'out')}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Saída
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={adjustmentDialog} onOpenChange={setAdjustmentDialog}>
        <DialogContent className="max-w-md bg-white border-gray-200 animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center">
              <div className={`${adjustmentType === 'in' ? 'bg-green-600' : 'bg-red-600'} p-3 rounded-xl mr-3 shadow-sm`}>
                {adjustmentType === 'in' ? (
                  <TrendingUp className="h-5 w-5 text-white" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-white" />
                )}
              </div>
              {adjustmentType === 'in' ? 'Entrada de Estoque' : 'Saída de Estoque'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{selectedProduct?.products?.name}</p>
              <p className="text-sm text-gray-600">Estoque atual: {selectedProduct?.current_stock}</p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="quantity" className="text-gray-700 font-medium">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                placeholder="Digite a quantidade"
              />
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <Label htmlFor="reason" className="text-gray-700 font-medium">Motivo</Label>
              <Input
                id="reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                placeholder="Ex: Compra, Venda, Perda, Ajuste"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustmentDialog(false)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStockAdjustment}
                className={`${
                  adjustmentType === 'in' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                disabled={adjustStockMutation.isPending}
              >
                {adjustStockMutation.isPending 
                  ? 'Processando...' 
                  : adjustmentType === 'in' 
                    ? 'Registrar Entrada' 
                    : 'Registrar Saída'
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryGrid;
