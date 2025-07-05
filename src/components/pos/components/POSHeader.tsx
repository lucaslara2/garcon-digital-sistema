
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
      count: totalItems > 0 ? totalItems : undefined,
    },
    {
      id: 'pending',
      label: 'Pendentes',
      icon: Clock,
    },
    {
      id: 'preparing',
      label: 'Em Preparo',
      icon: ChefHat,
    },
    {
      id: 'tickets',
      label: 'Comandas',
      icon: FileText,
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Sistema PDV
              </h1>
              <p className="text-xs text-gray-500 flex items-center">
                <span>{userProfile.name}</span>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-2"></div>
              </p>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id as any)}
                  className="relative px-3 py-2 text-sm rounded-md transition-colors"
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                  
                  {item.count && (
                    <Badge className="ml-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="bg-gray-50 px-4 py-2 rounded-lg border">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1.5 rounded">
                  <ShoppingCart className="h-3 w-3 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-gray-900 font-semibold text-sm">{totalItems}</div>
                  <div className="text-xs text-gray-500">itens</div>
                </div>
              </div>
              
              <div className="w-px h-6 bg-gray-300"></div>
              
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-1.5 rounded">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="text-gray-900 font-semibold text-sm">R$ {totalValue.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
