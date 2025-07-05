
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Receipt,
  Users,
  MessageSquare
} from 'lucide-react';

interface POSHeaderProps {
  userProfile: any;
  activeView: string;
  onViewChange: (view: string) => void;
  totalItems: number;
  totalValue: number;
  onOpenClientManager?: () => void;
  onOpenWhatsAppManager?: () => void;
}

export function POSHeader({ 
  userProfile, 
  activeView, 
  onViewChange, 
  totalItems, 
  totalValue,
  onOpenClientManager,
  onOpenWhatsAppManager
}: POSHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema POS</h1>
            <p className="text-gray-600">{userProfile?.name}</p>
          </div>

          {/* Navegação */}
          <div className="flex items-center space-x-2">
            <Button
              variant={activeView === 'new-order' ? 'default' : 'outline'}
              onClick={() => onViewChange('new-order')}
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Novo Pedido
              {totalItems > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">
                  {totalItems}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={activeView === 'pending' ? 'default' : 'outline'}
              onClick={() => onViewChange('pending')}
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pendentes
            </Button>
            
            <Button
              variant={activeView === 'preparing' ? 'default' : 'outline'}
              onClick={() => onViewChange('preparing')}
              size="sm"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Preparando
            </Button>
            
            <Button
              variant={activeView === 'tickets' ? 'default' : 'outline'}
              onClick={() => onViewChange('tickets')}
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Prontos
            </Button>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {onOpenClientManager && (
              <Button
                variant="outline"
                onClick={onOpenClientManager}
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Clientes
              </Button>
            )}
            
            {onOpenWhatsAppManager && (
              <Button
                variant="outline"
                onClick={onOpenWhatsAppManager}
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            )}
            
            {totalValue > 0 && activeView === 'new-order' && (
              <div className="bg-green-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-green-800">
                  Total: R$ {totalValue.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
