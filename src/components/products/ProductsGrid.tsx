
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
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h4 className="text-xl font-medium text-gray-700 mb-2">Carregando produtos...</h4>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
        <h4 className="text-xl font-medium text-gray-700 mb-2">Nenhum produto encontrado</h4>
        <p className="text-gray-500">
          {selectedCategory ? 'Nenhum produto nesta categoria' : 'Comece criando seu primeiro produto'}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      role="grid"
      aria-label="Lista de produtos"
    >
      {products.map((product, index) => {
        const profit = calculateProfit(product.price, product.cost_price || 0);
        const stockLevel = product.inventory?.[0]?.current_stock || 0;
        const minStock = product.inventory?.[0]?.min_stock || 0;
        const isLowStock = stockLevel <= minStock;

        return (
          <Card 
            key={product.id} 
            className="bg-white border-gray-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 animate-fade-in focus-within:ring-2 focus-within:ring-blue-500"
            style={{ animationDelay: `${index * 0.1}s` }}
            role="gridcell"
            tabIndex={0}
            aria-label={`Produto ${product.name}`}
          >
            <CardContent className="p-3 sm:p-6">
              {product.image_url && (
                <div className="w-full h-32 sm:h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product.image_url}
                    alt={`Imagem do produto ${product.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start justify-between">
                  <h3 
                    className="font-semibold text-gray-900 text-base sm:text-lg leading-tight"
                    id={`product-title-${product.id}`}
                  >
                    {product.name}
                  </h3>
                  {isLowStock && (
                    <Badge 
                      variant="destructive" 
                      className="text-xs ml-2 flex-shrink-0"
                      aria-label="Estoque baixo"
                    >
                      Estoque Baixo
                    </Badge>
                  )}
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm line-clamp-2" aria-describedby={`product-title-${product.id}`}>
                    {product.description}
                  </p>
                )}

                {product.category && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {product.category.name}
                  </Badge>
                )}

                {/* Preços e Lucro - Responsivo */}
                <div className="space-y-1 sm:space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Preço de Venda:</span>
                    <div className="flex items-center text-green-600 font-bold text-sm sm:text-base">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
                      R$ {product.price.toFixed(2)}
                    </div>
                  </div>

                  {product.cost_price > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Preço de Custo:</span>
                        <span className="text-red-600 font-medium text-sm">
                          R$ {product.cost_price.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Lucro Líquido:</span>
                        <div className="flex items-center text-green-600 font-bold text-sm">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" aria-hidden="true" />
                          R$ {profit.amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Margem:</span>
                        <Badge 
                          className={`text-xs ${
                            profit.percentage >= 50 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : profit.percentage >= 25
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                          aria-label={`Margem de lucro: ${profit.percentage.toFixed(1)}%`}
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
                    <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-2" aria-hidden="true" />
                    <span className="text-xs sm:text-sm">Estoque: {stockLevel}</span>
                  </div>
                  
                  <Badge 
                    className={`text-xs ${
                      stockLevel > minStock 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                    aria-label={`Status do estoque: ${stockLevel > minStock ? 'OK' : 'Baixo'}`}
                  >
                    {stockLevel > minStock ? 'OK' : 'Baixo'}
                  </Badge>
                </div>

                {/* Observações */}
                {product.product_observation_assignments?.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center mb-2">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500" aria-hidden="true" />
                      <span className="text-xs sm:text-sm text-gray-600">Observações:</span>
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

                {/* Ações - Responsivo */}
                <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-gray-100">
                  <Badge 
                    className={`text-xs ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  <div className="flex space-x-1 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditProduct(product)}
                      className="p-1 sm:p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Editar produto ${product.name}`}
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      className="p-1 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Excluir produto ${product.name}`}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
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
