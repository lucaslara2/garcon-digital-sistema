
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <div className="card-gradient rounded-xl border h-full modern-shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <div className="primary-gradient p-2 rounded-lg mr-3">
              <Package className="h-5 w-5 text-white" />
            </div>
            Produtos
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="bg-muted p-6 rounded-xl mb-6">
            <Package className="h-16 w-16 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Nenhum produto disponível</h3>
          <p className="text-sm text-center max-w-xs leading-relaxed">
            Configure produtos no painel de gerenciamento para começar a vender
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl border h-full flex flex-col modern-shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <div className="primary-gradient p-2 rounded-lg mr-3">
              <Package className="h-5 w-5 text-white" />
            </div>
            Produtos
          </h2>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {filteredProducts?.length || 0} itens
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts?.map((product) => (
            <Button
              key={product.id}
              variant="outline"
              className="h-auto p-4 flex flex-col border bg-card hover:bg-muted/50 text-left group transition-all duration-200 hover:scale-[1.02] rounded-lg modern-shadow"
              onClick={() => onAddToCart(product)}
            >
              <div className="w-full space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-2 transition-colors">
                      {product.name}
                    </div>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs mt-2 bg-muted text-muted-foreground">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors ml-3">
                    <Plus className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-emerald-600">
                    R$ {product.price.toFixed(2)}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-4 w-4 text-primary" />
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
