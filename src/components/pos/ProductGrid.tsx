
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/gradient-card';
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
      <div className="bg-slate-900 rounded-lg border border-slate-800 h-full">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Package className="h-5 w-5 mr-2 text-amber-400" />
            Produtos
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package className="h-16 w-16 mb-4 text-slate-600" />
          <p className="text-lg font-medium mb-2">Nenhum produto disponível</p>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            Configure produtos no painel de gerenciamento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 h-full flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center mb-3">
          <Package className="h-5 w-5 mr-2 text-amber-400" />
          Produtos
        </h2>
        
        {/* Busca */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts?.map((product) => (
            <Button
              key={product.id}
              variant="outline"
              className="h-auto p-3 flex flex-col border-slate-700 bg-slate-800 hover:bg-slate-700 text-left group"
              onClick={() => onAddToCart(product)}
            >
              <div className="w-full space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-amber-300 line-clamp-2">
                      {product.name}
                    </div>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs mt-1 bg-slate-700 text-slate-300">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                  <Plus className="h-4 w-4 text-slate-400 group-hover:text-amber-400 ml-2 flex-shrink-0" />
                </div>
                
                <div className="text-lg font-bold text-amber-400">
                  R$ {product.price.toFixed(2)}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <p className="text-sm text-slate-400">
          {filteredProducts?.length || 0} produtos
        </p>
      </div>
    </div>
  );
}
