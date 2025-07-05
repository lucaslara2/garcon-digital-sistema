
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/gradient-card';
import { Package, Search, Plus, Sparkles } from 'lucide-react';
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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 h-full shadow-2xl">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white flex items-center">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-xl mr-3">
              <Package className="h-5 w-5 text-white" />
            </div>
            Produtos
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="bg-slate-800/50 p-6 rounded-2xl mb-6">
            <Package className="h-16 w-16 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-slate-300">Nenhum produto disponível</h3>
          <p className="text-sm text-slate-500 text-center max-w-xs leading-relaxed">
            Configure produtos no painel de gerenciamento para começar a vender
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 h-full flex flex-col shadow-2xl">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-2 rounded-xl mr-3">
              <Package className="h-5 w-5 text-white" />
            </div>
            Produtos
          </h2>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            {filteredProducts?.length || 0} itens
          </Badge>
        </div>
        
        {/* Enhanced Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts?.map((product) => (
            <Button
              key={product.id}
              variant="outline"
              className="h-auto p-4 flex flex-col border-slate-600/50 bg-gradient-to-br from-slate-800/50 to-slate-700/50 hover:from-slate-700/50 hover:to-slate-600/50 text-left group transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl"
              onClick={() => onAddToCart(product)}
            >
              <div className="w-full space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-amber-300 line-clamp-2 transition-colors">
                      {product.name}
                    </div>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs mt-2 bg-slate-700/50 text-slate-300 border-slate-600/50">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-emerald-500/20 p-2 rounded-lg group-hover:bg-emerald-500/30 transition-colors ml-3">
                    <Plus className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-amber-400">
                    R$ {product.price.toFixed(2)}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-4 w-4 text-amber-400" />
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
