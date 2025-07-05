
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  name: string;
  price: number;
  category?: {
    name: string;
  };
}

interface ProductGridProps {
  products: Product[] | undefined;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!products?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 h-full shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Package className="h-4 w-4 text-white" />
            </div>
            Produtos
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Package className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">Nenhum produto disponível</h3>
          <p className="text-sm text-center max-w-xs">
            Configure produtos no painel de gerenciamento para começar a vender
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Package className="h-4 w-4 text-white" />
            </div>
            Produtos
          </h2>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
            {filteredProducts?.length || 0} itens
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm bg-white border-gray-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts?.map((product) => (
            <Button
              key={product.id}
              variant="outline"
              className="h-auto p-3 flex flex-col border border-gray-200 bg-white hover:bg-gray-50 text-left group transition-all duration-200 rounded-lg hover:border-blue-300"
              onClick={() => onAddToCart(product)}
            >
              <div className="w-full space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                      {product.name}
                    </div>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs mt-1 bg-gray-100 text-gray-600 border-gray-200">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-green-100 p-1.5 rounded-lg group-hover:bg-green-200 transition-colors ml-2">
                    <Plus className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
