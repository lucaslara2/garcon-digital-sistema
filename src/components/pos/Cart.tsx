
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
      <div className="card-gradient rounded-xl border h-full modern-shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <div className="bg-emerald-500/10 p-2 rounded-lg mr-3">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
            </div>
            Carrinho
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="bg-muted p-6 rounded-xl mb-6">
            <Package className="h-12 w-12 text-muted-foreground/60" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Carrinho vazio</h3>
          <p className="text-sm">Selecione produtos para adicionar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl border h-full flex flex-col modern-shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <div className="bg-emerald-500/10 p-2 rounded-lg mr-3">
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
            </div>
            Carrinho
          </h2>
          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 px-3 py-1">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {cart.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-background/50 rounded-lg p-4 border hover:border-primary/30 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  R$ {item.price.toFixed(2)} • unidade
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-emerald-600 text-lg">R$ {item.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all"
                  onClick={() => onRemoveFromCart(item.id)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
                  <span className="text-sm font-bold text-primary">{item.quantity}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition-all"
                  onClick={() => onAddToCart({ ...item, id: item.id })}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                {item.quantity} × R$ {item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t space-y-4">
        <div className="success-gradient rounded-lg p-4 border border-emerald-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-white font-semibold">Total Geral</span>
              <p className="text-xs text-emerald-100 flex items-center mt-1">
                <Sparkles className="h-3 w-3 mr-1" />
                {totalItems} itens no carrinho
              </p>
            </div>
            <span className="text-2xl font-bold text-white">R$ {totalValue.toFixed(2)}</span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCart}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg py-3 transition-all"
        >
          <X className="h-4 w-4 mr-2" />
          Limpar Carrinho
        </Button>
      </div>
    </div>
  );
}
