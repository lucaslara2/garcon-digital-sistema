
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface CartProps {
  cart: CartItem[];
  onAddToCart: (product: { id: string; name: string; price: number }) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
}

export function Cart({ cart, onAddToCart, onRemoveFromCart, onClearCart }: CartProps) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-green-600 p-2 rounded-lg mr-3">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            Carrinho
          </h2>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </Badge>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
          <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-600">Carrinho vazio</h3>
          <p className="text-sm text-center max-w-xs">
            Adicione produtos clicando nos itens do menu
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        R$ {item.price.toFixed(2)} cada
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-bold text-green-600 text-sm">
                        R$ {item.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveFromCart(item.id)}
                        className="h-7 w-7 p-0 border-gray-300 hover:bg-red-50 hover:border-red-300"
                      >
                        <Minus className="h-3 w-3 text-gray-600" />
                      </Button>
                      
                      <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddToCart(item)}
                        className="h-7 w-7 p-0 border-gray-300 hover:bg-green-50 hover:border-green-300"
                      >
                        <Plus className="h-3 w-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-xl">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">R$ {totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-green-600">R$ {totalValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
