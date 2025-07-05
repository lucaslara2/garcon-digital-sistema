
import React from 'react';
import { Button } from '@/components/ui/button';
import { GradientCard } from '@/components/ui/gradient-card';
import { Plus, Minus, ShoppingCart, Trash2, Package, X } from 'lucide-react';
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
        className="h-full shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-8 rounded-2xl mb-6 border border-slate-600/30">
            <Package className="h-12 w-12 text-slate-500" />
          </div>
          <p className="text-lg font-medium mb-2">Carrinho vazio</p>
          <p className="text-sm text-slate-500 text-center">
            Selecione produtos para iniciar uma venda
          </p>
        </div>
      </GradientCard>
    );
  }

  return (
    <GradientCard 
      title={`Carrinho • ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
      icon={<ShoppingCart className="h-5 w-5" />}
      className="h-full flex flex-col shadow-2xl border-slate-700/50"
    >
      {/* Lista de Itens Premium */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-6">
        {cart.map((item) => (
          <div key={item.id} className="group bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-4 border border-slate-600/30 hover:border-amber-500/40 transition-all duration-200 hover:shadow-lg backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-amber-100 transition-colors">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-400">
                  R$ {item.price.toFixed(2)} • unidade
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-amber-400 text-sm group-hover:text-amber-300 transition-colors">
                  R$ {item.total.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-slate-600/50 bg-slate-800/60 hover:bg-red-600/20 hover:border-red-500/50 transition-all group/btn"
                  onClick={() => onRemoveFromCart(item.id)}
                >
                  <Minus className="h-3 w-3 text-slate-300 group-hover/btn:text-red-400 transition-colors" />
                </Button>
                
                <div className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 px-4 py-1.5 rounded-lg border border-slate-600/50 shadow-inner">
                  <span className="text-sm font-bold text-amber-300">
                    {item.quantity}
                  </span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-slate-600/50 bg-slate-800/60 hover:bg-green-600/20 hover:border-green-500/50 transition-all group/btn"
                  onClick={() => onAddToCart({ ...item, id: item.id })}
                >
                  <Plus className="h-3 w-3 text-slate-300 group-hover/btn:text-green-400 transition-colors" />
                </Button>
              </div>
              
              <div className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.quantity} × R$ {item.price.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-6" />

      {/* Resumo e Ações Premium */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-4 border border-amber-500/30 shadow-lg backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-300 font-medium">Total do Pedido</span>
              <p className="text-xs text-amber-200/70">{totalItems} itens</p>
            </div>
            <span className="text-2xl font-bold text-amber-400">
              R$ {totalValue.toFixed(2)}
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearCart}
          className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-500 hover:text-red-300 transition-all bg-red-900/20 group"
        >
          <X className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
          Limpar Carrinho
        </Button>
      </div>
    </GradientCard>
  );
}
