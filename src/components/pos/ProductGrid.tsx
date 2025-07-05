
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/gradient-card';
import { ShoppingCart, Package, Search, Plus } from 'lucide-react';
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
        className="h-full shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-8 rounded-2xl mb-6 border border-slate-600/30">
            <Package className="h-16 w-16 text-slate-500" />
          </div>
          <p className="text-lg font-medium mb-2">Nenhum produto disponível</p>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            Configure produtos no painel de gerenciamento para começar as vendas
          </p>
        </div>
      </GradientCard>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <GradientCard 
        title="Produtos" 
        icon={<ShoppingCart className="h-5 w-5" />}
        className="h-full flex flex-col shadow-2xl border-slate-700/50"
      >
        {/* Barra de Pesquisa Premium */}
        <div className="mb-6 relative">
          <div className="relative group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
            <Input
              placeholder="Buscar produtos ou categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-slate-600/50 text-white placeholder-slate-400 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all duration-200 shadow-lg"
            />
          </div>
        </div>

        {/* Grid de Produtos Premium */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts?.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto p-0 flex flex-col border-slate-600/30 bg-gradient-to-br from-slate-800/60 to-slate-700/60 hover:from-slate-700/80 hover:to-slate-600/80 hover:border-amber-500/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-xl shadow-lg backdrop-blur-sm"
                onClick={() => onAddToCart(product)}
              >
                <div className="w-full p-4 space-y-3">
                  {/* Header do Produto */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-2 mb-1">
                        {product.name}
                      </div>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs bg-slate-600/60 text-slate-300 border-slate-500/50 group-hover:bg-amber-900/30 group-hover:text-amber-200 transition-colors">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-500/30">
                        <Plus className="h-3 w-3 text-amber-400" />
                      </div>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                      R$ {product.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Clique para adicionar
                    </div>
                  </div>
                </div>

                {/* Borda inferior animada */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/50 transition-all duration-300"></div>
              </Button>
            ))}
          </div>
        </div>

        {/* Contador de Produtos Premium */}
        <div className="mt-6 pt-4 border-t border-slate-600/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {filteredProducts?.length || 0} produtos {searchTerm && 'encontrados'}
            </p>
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-white text-xs h-auto p-1"
              >
                Limpar busca
              </Button>
            )}
          </div>
        </div>
      </GradientCard>
    </div>
  );
}
