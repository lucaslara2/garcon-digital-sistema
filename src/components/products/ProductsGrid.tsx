
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  ImageIcon,
  Star,
  Eye
} from 'lucide-react';

interface ProductsGridProps {
  products: any[];
}

const ProductsGrid = ({ products }: ProductsGridProps) => {
  const getStockStatus = (product: any) => {
    const inventory = product.inventory?.[0];
    if (!inventory) return { color: 'bg-slate-500', text: 'N/A' };
    
    const { current_stock, min_stock } = inventory;
    
    if (current_stock <= 0) {
      return { color: 'bg-red-500', text: 'Sem estoque' };
    } else if (current_stock <= min_stock) {
      return { color: 'bg-orange-500', text: 'Baixo' };
    } else {
      return { color: 'bg-green-500', text: 'OK' };
    }
  };

  if (products.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="text-center py-12">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum produto encontrado</h3>
          <p className="text-slate-400">Comece criando seu primeiro produto!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        
        return (
          <Card key={product.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors group">
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="relative aspect-square bg-slate-700 rounded-t-lg overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-slate-500" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={`${stockStatus.color} text-white text-xs`}>
                    {stockStatus.text}
                  </Badge>
                </div>

                {/* Active Status */}
                {!product.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Inativo</Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white line-clamp-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-slate-400 text-sm line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Category and Price */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {product.category && (
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                    <div className="flex items-center text-green-400 font-bold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {product.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center text-amber-400 text-sm">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      <span>4.5</span>
                    </div>
                    <div className="flex items-center text-slate-400 text-xs mt-1">
                      <Package className="h-3 w-3 mr-1" />
                      {product.inventory?.[0]?.current_stock || 0}
                    </div>
                  </div>
                </div>

                {/* Addons Info */}
                {product.product_addons?.length > 0 && (
                  <div className="text-amber-400 text-xs">
                    +{product.product_addons.length} adicional(is)
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-red-600 border-red-500 text-white hover:bg-red-700"
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
