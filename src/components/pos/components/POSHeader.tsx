
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingCart, Plus, Clock, ChefHat, FileText, TrendingUp, Sparkles } from 'lucide-react';

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
    <div className="glass-effect border-b sticky top-0 z-50 modern-shadow">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="primary-gradient p-3 rounded-xl modern-shadow">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Sistema PDV
              </h1>
              <p className="text-sm text-muted-foreground flex items-center">
                <span>{userProfile.name}</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2 animate-pulse"></div>
              </p>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-2">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id as any)}
                  className={`
                    relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                  
                  {/* Badge for counts */}
                  {item.count && (
                    <Badge className="ml-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="flex items-center space-x-4">
            <div className="card-gradient px-6 py-3 rounded-xl border modern-shadow">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-foreground font-bold">{totalItems}</div>
                    <div className="text-xs text-muted-foreground">itens</div>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-border"></div>
                
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-foreground font-bold">R$ {totalValue.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">total</div>
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
