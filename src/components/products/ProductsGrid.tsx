
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ImageIcon
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductsGridProps {
  products: any[];
}

const ProductsGrid = ({ products }: ProductsGridProps) => {
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
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

  const getStockStatus = (product: any) => {
    const inventory = product.inventory?.[0];
    if (!inventory) return { status: 'unknown', color: 'bg-gray-500', text: 'N/A' };
    
    const { current_stock, min_stock } = inventory;
    
    if (current_stock <= 0) {
      return { status: 'out', color: 'bg-red-500', text: 'Sem estoque' };
    } else if (current_stock <= min_stock) {
      return { status: 'low', color: 'bg-orange-500', text: 'Estoque baixo' };
    } else {
      return { status: 'good', color: 'bg-green-500', text: 'Estoque OK' };
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Nenhum produto encontrado</h3>
        <p className="text-slate-400">Comece criando seu primeiro produto!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        
        return (
          <Card key={product.id} className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
            <CardContent className="p-4">
              {/* Product Image */}
              <div className="relative mb-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-600 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                
                {/* Stock Status Badge */}
                <Badge className={`absolute top-2 right-2 ${stockStatus.color} text-white text-xs`}>
                  {stockStatus.text}
                </Badge>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-white truncate pr-2">{product.name}</h3>
                  <div className="flex items-center text-green-400 font-bold text-sm whitespace-nowrap">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {product.price.toFixed(2)}
                  </div>
                </div>

                {product.description && (
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {product.description}
                  </p>
                )}

                {/* Category */}
                {product.category && (
                  <Badge variant="secondary" className="bg-slate-600 text-slate-300 text-xs">
                    {product.category.name}
                  </Badge>
                )}

                {/* Stock Info */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    Estoque: {product.inventory?.[0]?.current_stock || 0}
                  </div>
                  
                  {product.product_addons?.length > 0 && (
                    <div className="text-amber-400">
                      +{product.product_addons.length} adicional(is)
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t border-slate-600">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-600 border-red-500 text-white hover:bg-red-700"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductsGrid;
