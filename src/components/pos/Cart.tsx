
import React from 'react';
import { Button } from '@/components/ui/button';
import { GradientCard } from '@/components/ui/gradient-card';
import { Plus, Minus, ShoppingCart, Trash2, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cart.reduce((sum, item) => sum + item.total, 0);

  if (cart.length === 0) {
    return (
      <GradientCard 
        title="Carrinho" 
        icon={<ShoppingCart className="h-5 w-5" />}
        className="h-full"
      >
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="bg-slate-700/50 p-6 rounded-full mb-4">
            <Package className="h-12 w-12 text-slate-500" />
          </div>
          <p className="text-lg font-medium mb-2">Carrinho vazio</p>
          <p className="text-sm text-slate-500">Adicione produtos para começar</p>
        </div>
      </GradientCard>
    );
  }

  return (
    <GradientCard 
      title={`Carrinho (${totalItems} ${totalItems === 1 ? 'item' : 'itens'})`}
      icon={<ShoppingCart className="h-5 w-5" />}
      className="h-full flex flex-col"
    >
      {/* Lista de Itens */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {cart.map((item) => (
          <div key={item.id} className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400">
                  R$ {item.price.toFixed(2)} cada
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-amber-400 text-sm">
                  R$ {item.total.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-slate-600 bg-slate-800/50 hover:bg-red-600/20 hover:border-red-500/50 transition-all"
                  onClick={() => onRemoveFromCart(item.id)}
                >
                  <Minus className="h-3 w-3 text-slate-300" />
                </Button>
                <div className="bg-slate-700/50 px-3 py-1 rounded-md border border-slate-600/50">
                  <span className="text-sm font-medium text-white">
                    {item.quantity}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-slate-600 bg-slate-800/50 hover:bg-green-600/20 hover:border-green-500/50 transition-all"
                  onClick={() => onAddToCart({ ...item, id: item.id })}
                >
                  <Plus className="h-3 w-3 text-slate-300" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-slate-600 mb-4" />

      {/* Resumo e Ações */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-500/20">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Total:</span>
            <span className="text-xl font-bold text-amber-400">
              R$ {totalValue.toFixed(2)}
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCart}
          className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 transition-all"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Carrinho
        </Button>
      </div>
    </GradientCard>
  );
}
