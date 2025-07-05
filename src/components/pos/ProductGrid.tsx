
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/gradient-card';
import { ShoppingCart, Package } from 'lucide-react';

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
    <GradientCard 
      title="Produtos" 
      icon={<ShoppingCart className="h-5 w-5" />}
      className="h-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {products.map((product) => (
          <Button
            key={product.id}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center text-center border-slate-600 bg-slate-700/50 hover:bg-slate-600/50 hover:border-amber-500/50 transition-all duration-200 group"
            onClick={() => onAddToCart(product)}
          >
            <div className="text-sm font-medium mb-2 text-white group-hover:text-amber-300 transition-colors">
              {product.name}
            </div>
            <div className="text-lg font-bold text-amber-400 mb-2">
              R$ {product.price.toFixed(2)}
            </div>
            {product.category && (
              <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                {product.category.name}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </GradientCard>
  );
}
