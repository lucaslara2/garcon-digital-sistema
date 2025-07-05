
import React from 'react';
import { Button } from '@/components/ui/button';
import { GradientCard } from '@/components/ui/gradient-card';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface CartProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
}

export function Cart({ cart, onAddToCart, onRemoveFromCart, onClearCart }: CartProps) {
  if (cart.length === 0) {
    return (
      <GradientCard 
        title="Carrinho" 
        icon={<ShoppingCart className="h-5 w-5" />}
        className="animate-fade-in"
      >
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <ShoppingCart className="h-12 w-12 mb-3 text-slate-600" />
          <p className="text-sm">Carrinho vazio</p>
          <p className="text-xs text-slate-500 mt-1">Adicione produtos para começar</p>
        </div>
      </GradientCard>
    );
  }

  return (
    <GradientCard 
      title="Carrinho" 
      icon={<ShoppingCart className="h-5 w-5" />}
      className="animate-fade-in"
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-white truncate">{item.name}</div>
              <div className="text-xs text-slate-400">
                R$ {item.price.toFixed(2)} cada
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-slate-600 bg-slate-800 hover:bg-slate-700"
                onClick={() => onRemoveFromCart(item.id)}
              >
                <Minus className="h-3 w-3 text-slate-300" />
              </Button>
              <span className="text-sm font-medium w-8 text-center text-white">
                {item.quantity}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 border-slate-600 bg-slate-800 hover:bg-slate-700"
                onClick={() => onAddToCart({ ...item, id: item.id })}
              >
                <Plus className="h-3 w-3 text-slate-300" />
              </Button>
            </div>
            
            <div className="text-sm font-bold w-16 text-right text-amber-400 ml-2">
              R$ {item.total.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {cart.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-600">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCart}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Carrinho
          </Button>
        </div>
      )}
    </GradientCard>
  );
}
