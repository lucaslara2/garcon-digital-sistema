
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Edit,
  Plus,
  Minus
} from 'lucide-react';

interface InventoryGridProps {
  products: any[];
}

const InventoryGrid = ({ products }: InventoryGridProps) => {
  const getStockStatus = (inventory: any) => {
    if (!inventory) return { status: 'unknown', color: 'bg-gray-500', text: 'N/A', icon: Package };
    
    const { current_stock, min_stock, max_stock } = inventory;
    
    if (current_stock <= 0) {
      return { status: 'out', color: 'bg-red-500', text: 'Sem estoque', icon: AlertTriangle };
    } else if (current_stock <= min_stock) {
      return { status: 'low', color: 'bg-orange-500', text: 'Estoque baixo', icon: TrendingDown };
    } else if (current_stock >= max_stock * 0.8) {
      return { status: 'high', color: 'bg-blue-500', text: 'Estoque alto', icon: TrendingUp };
    } else {
      return { status: 'normal', color: 'bg-green-500', text: 'Estoque normal', icon: Package };
    }
  };

  const productsWithInventory = products.filter(p => p.inventory && p.inventory.length > 0);

  if (productsWithInventory.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-12">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum controle de estoque encontrado</h3>
          <p className="text-slate-400">Configure o estoque dos seus produtos para começar!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Controle de Estoque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {productsWithInventory.map((product) => {
            const inventory = product.inventory[0];
            const stockStatus = getStockStatus(inventory);
            const StatusIcon = stockStatus.icon;
            
            return (
              <div
                key={product.id}
                className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${stockStatus.color.replace('bg-', 'bg-')}/20`}>
                      <StatusIcon className={`h-5 w-5 ${stockStatus.color.replace('bg-', 'text-')}`} />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-white">{product.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                        <span>Atual: <span className="text-white font-medium">{inventory.current_stock}</span></span>
                        <span>Mín: {inventory.min_stock}</span>
                        <span>Máx: {inventory.max_stock}</span>
                        {inventory.unit_cost && (
                          <span>Custo: R$ {inventory.unit_cost.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={`${stockStatus.color} text-white`}>
                      {stockStatus.text}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-red-600 border-red-500 text-white hover:bg-red-700"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-green-600 border-green-500 text-white hover:bg-green-700"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;
