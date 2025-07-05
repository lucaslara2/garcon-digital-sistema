
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingCart, Plus, Clock, ChefHat, FileText, TrendingUp } from 'lucide-react';

interface POSHeaderProps {
  userProfile: any;
  activeView: 'new-order' | 'pending' | 'preparing' | 'tickets';
  onViewChange: (view: 'new-order' | 'pending' | 'preparing' | 'tickets') => void;
  totalItems: number;
  totalValue: number;
}

export function POSHeader({ userProfile, activeView, onViewChange, totalItems, totalValue }: POSHeaderProps) {
  const menuItems = [
    {
      id: 'new-order',
      label: 'Novo Pedido',
      icon: Plus,
      color: 'from-emerald-500 to-emerald-600',
      count: totalItems > 0 ? totalItems : undefined,
    },
    {
      id: 'pending',
      label: 'Pendentes',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'preparing',
      label: 'Em Preparo',
      icon: ChefHat,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'tickets',
      label: 'Comandas',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
    }
  ];

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-xl shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sistema PDV</h1>
              <p className="text-sm text-slate-400 flex items-center">
                <span>{userProfile.name}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
              </p>
            </div>
          </div>
          
          {/* Enhanced Navigation Menu */}
          <div className="flex items-center space-x-2">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange(item.id as any)}
                  className={`
                    relative px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group
                    ${isActive 
                      ? 'bg-gradient-to-r text-white shadow-lg transform scale-105' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }
                  `}
                  style={isActive ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` } : {}}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  
                  {/* Badge for counts */}
                  {item.count && (
                    <Badge className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.count}
                    </Badge>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Enhanced Cart Summary */}
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 rounded-xl border border-slate-600/50 shadow-lg">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="bg-amber-500/20 p-1.5 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{totalItems}</div>
                    <div className="text-xs text-slate-400">itens</div>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-slate-600"></div>
                
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">R$ {totalValue.toFixed(2)}</div>
                    <div className="text-xs text-slate-400">total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
