
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart, Package, X } from 'lucide-react';

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
      <div className="bg-slate-900 rounded-lg border border-slate-800 h-full">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-amber-400" />
            Carrinho
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package className="h-12 w-12 mb-4 text-slate-600" />
          <p className="text-lg font-medium mb-2">Carrinho vazio</p>
          <p className="text-sm text-slate-500">Selecione produtos para adicionar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 h-full flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-amber-400" />
          Carrinho • {totalItems} {totalItems === 1 ? 'item' : 'itens'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm mb-1 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400">R$ {item.price.toFixed(2)} • unidade</p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-amber-400 text-sm">R$ {item.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-slate-600 bg-slate-700 hover:bg-red-600/20"
                  onClick={() => onRemoveFromCart(item.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="bg-slate-700 px-3 py-1 rounded border border-slate-600">
                  <span className="text-sm font-bold text-amber-300">{item.quantity}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-slate-600 bg-slate-700 hover:bg-green-600/20"
                  onClick={() => onAddToCart({ ...item, id: item.id })}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-slate-500">
                {item.quantity} × R$ {item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-500/30">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-300 font-medium">Total</span>
              <p className="text-xs text-amber-200/70">{totalItems} itens</p>
            </div>
            <span className="text-xl font-bold text-amber-400">R$ {totalValue.toFixed(2)}</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCart}
          className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10"
        >
          <X className="h-4 w-4 mr-2" />
          Limpar Carrinho
        </Button>
      </div>
    </div>
  );
}
