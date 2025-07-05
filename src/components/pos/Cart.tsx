
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <div className="bg-white rounded-lg border border-gray-200 h-full shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-green-600 p-2 rounded-lg mr-3">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            Carrinho
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Package className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">Carrinho vazio</h3>
          <p className="text-sm">Selecione produtos para adicionar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-green-600 p-2 rounded-lg mr-3">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            Carrinho
          </h2>
          <Badge variant="secondary" className="text-xs">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-gray-50 rounded-lg p-3 border hover:border-blue-300 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500">
                  R$ {item.price.toFixed(2)} • unidade
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-green-600">R$ {item.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                  onClick={() => onRemoveFromCart(item.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="bg-blue-100 px-3 py-1 rounded border border-blue-200">
                  <span className="text-sm font-semibold text-blue-700">{item.quantity}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-green-200 bg-green-50 hover:bg-green-100 text-green-600"
                  onClick={() => onAddToCart({ ...item, id: item.id })}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {item.quantity} × R$ {item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="bg-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-green-800 font-semibold">Total Geral</span>
              <p className="text-xs text-green-600 mt-1">
                {totalItems} itens no carrinho
              </p>
            </div>
            <span className="text-xl font-bold text-green-800">R$ {totalValue.toFixed(2)}</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCart}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 py-2 text-sm"
        >
          <X className="h-4 w-4 mr-2" />
          Limpar Carrinho
        </Button>
      </div>
    </div>
  );
}
