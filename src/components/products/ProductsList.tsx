
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  ImageIcon,
  Eye
} from 'lucide-react';

interface ProductsListProps {
  products: any[];
}

const ProductsList = ({ products }: ProductsListProps) => {
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
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum produto encontrado</h3>
          <p className="text-slate-400">Comece criando seu primeiro produto!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        
        return (
          <div 
            key={product.id} 
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-750 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-slate-400 text-sm truncate mt-1">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-2">
                      {/* Category */}
                      {product.category && (
                        <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                      
                      {/* Stock Status */}
                      <Badge className={`${stockStatus.color} text-white text-xs`}>
                        {stockStatus.text}
                      </Badge>
                      
                      {/* Active Status */}
                      <Badge 
                        className={product.is_active ? 'bg-green-600' : 'bg-red-600'} 
                        variant="secondary"
                      >
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      
                      {/* Addons */}
                      {product.product_addons?.length > 0 && (
                        <span className="text-amber-400 text-xs">
                          +{product.product_addons.length} adicional(is)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price and Stock */}
                  <div className="text-right ml-4">
                    <div className="flex items-center text-green-400 font-bold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {product.price.toFixed(2)}
                    </div>
                    <div className="flex items-center text-slate-400 text-sm mt-1">
                      <Package className="h-3 w-3 mr-1" />
                      {product.inventory?.[0]?.current_stock || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-600 border-red-500 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductsList;
