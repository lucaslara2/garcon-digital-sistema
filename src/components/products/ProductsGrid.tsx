
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  DollarSign,
  TrendingUp,
  Package,
  Eye
} from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';

interface ProductsGridProps {
  selectedCategory: string;
  onEditProduct: (product: any) => void;
}

const ProductsGrid = ({ selectedCategory, onEditProduct }: ProductsGridProps) => {
  const { data: products = [], isLoading } = useProducts(selectedCategory);
  const deleteProductMutation = useDeleteProduct();

  const calculateProfit = (salePrice: number, costPrice: number) => {
    if (!costPrice || costPrice === 0) return { amount: 0, percentage: 0 };
    const profit = salePrice - costPrice;
    const percentage = (profit / costPrice) * 100;
    return { amount: profit, percentage };
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-xl font-medium text-gray-700 mb-2">Carregando produtos...</h4>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-xl font-medium text-gray-700 mb-2">Nenhum produto encontrado</h4>
        <p className="text-gray-500">
          {selectedCategory ? 'Nenhum produto nesta categoria' : 'Comece criando seu primeiro produto'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => {
        const profit = calculateProfit(product.price, product.cost_price || 0);
        const stockLevel = product.inventory?.[0]?.current_stock || 0;
        const minStock = product.inventory?.[0]?.min_stock || 0;
        const isLowStock = stockLevel <= minStock;

        return (
          <Card 
            key={product.id} 
            className="bg-white border-gray-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6">
              {product.image_url && (
                <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                  {isLowStock && (
                    <Badge variant="destructive" className="text-xs">
                      Estoque Baixo
                    </Badge>
                  )}
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                )}

                {product.category && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {product.category.name}
                  </Badge>
                )}

                {/* Preços e Lucro */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preço de Venda:</span>
                    <div className="flex items-center text-green-600 font-bold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      R$ {product.price.toFixed(2)}
                    </div>
                  </div>

                  {product.cost_price > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Preço de Custo:</span>
                        <span className="text-red-600 font-medium">
                          R$ {product.cost_price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Lucro Líquido:</span>
                        <div className="flex items-center text-green-600 font-bold">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          R$ {profit.amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Margem:</span>
                        <Badge 
                          className={`${
                            profit.percentage >= 50 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : profit.percentage >= 25
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {profit.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {/* Estoque */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    <span className="text-sm">Estoque: {stockLevel}</span>
                  </div>
                  
                  <Badge 
                    className={`text-xs ${
                      stockLevel > minStock 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {stockLevel > minStock ? 'OK' : 'Baixo'}
                  </Badge>
                </div>

                {/* Observações */}
                {product.product_observation_assignments?.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center mb-2">
                      <Eye className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Observações:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.product_observation_assignments.map((assignment: any) => (
                        <Badge 
                          key={assignment.product_observations.name}
                          variant="outline" 
                          className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          {assignment.product_observations.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Badge 
                    className={`text-xs ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditProduct(product)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
