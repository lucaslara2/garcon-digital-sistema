
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/gradient-card';
import { ShoppingCart, Package, Search } from 'lucide-react';
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
      <GradientCard 
        title="Produtos" 
        icon={<Package className="h-5 w-5" />}
        className="h-full"
      >
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Package className="h-16 w-16 mb-4 text-slate-600" />
          <p className="text-lg mb-2">Nenhum produto disponível</p>
          <p className="text-sm">Configure produtos no painel de gerenciamento</p>
        </div>
      </GradientCard>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <GradientCard 
        title="Produtos" 
        icon={<ShoppingCart className="h-5 w-5" />}
        className="h-full flex flex-col"
      >
        {/* Barra de Pesquisa */}
        <div className="mb-4 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        {/* Grid de Produtos */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts?.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center text-center border-slate-600 bg-gradient-to-br from-slate-800/50 to-slate-700/50 hover:from-slate-700/70 hover:to-slate-600/70 hover:border-amber-500/50 transition-all duration-200 group hover:scale-105"
                onClick={() => onAddToCart(product)}
              >
                <div className="w-full">
                  <div className="text-sm font-medium mb-2 text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {product.name}
                  </div>
                  <div className="text-lg font-bold text-amber-400 mb-2">
                    R$ {product.price.toFixed(2)}
                  </div>
                  {product.category && (
                    <Badge variant="secondary" className="text-xs bg-slate-600/50 text-slate-300 border-slate-500">
                      {product.category.name}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Contador de Produtos */}
        <div className="mt-4 pt-3 border-t border-slate-600">
          <p className="text-sm text-slate-400 text-center">
            {filteredProducts?.length || 0} produtos disponíveis
          </p>
        </div>
      </GradientCard>
    </div>
  );
}
