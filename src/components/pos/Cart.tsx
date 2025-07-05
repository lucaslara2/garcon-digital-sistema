
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart, Package, X, Sparkles } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 h-full shadow-2xl">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white flex items-center">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 p-2 rounded-xl mr-3">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            Carrinho
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="bg-slate-800/50 p-6 rounded-2xl mb-6">
            <Package className="h-12 w-12 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-300">Carrinho vazio</h3>
          <p className="text-sm text-slate-500">Selecione produtos para adicionar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 h-full flex flex-col shadow-2xl">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 p-2 rounded-xl mr-3">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            Carrinho
          </h2>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  R$ {item.price.toFixed(2)} • unidade
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-amber-400 text-lg">R$ {item.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                  onClick={() => onRemoveFromCart(item.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-4 py-2 rounded-lg border border-amber-500/30">
                  <span className="text-sm font-bold text-amber-300">{item.quantity}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition-all"
                  onClick={() => onAddToCart({ ...item, id: item.id })}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg">
                {item.quantity} × R$ {item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-700/50 space-y-4">
        <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/30 rounded-xl p-4 border border-amber-500/30">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-300 font-semibold">Total Geral</span>
              <p className="text-xs text-amber-200/70 flex items-center mt-1">
                <Sparkles className="h-3 w-3 mr-1" />
                {totalItems} itens no carrinho
              </p>
            </div>
            <span className="text-2xl font-bold text-amber-400">R$ {totalValue.toFixed(2)}</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCart}
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl py-3 transition-all"
        >
          <X className="h-4 w-4 mr-2" />
          Limpar Carrinho
        </Button>
      </div>
    </div>
  );
}
