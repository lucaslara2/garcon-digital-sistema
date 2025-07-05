
import React from 'react';
import { Label } from '@/components/ui/label';
import { Store, Truck, Package, Users } from 'lucide-react';
import { OrderType } from '../types/orderTypes';

interface OrderTypeSelectorProps {
  orderType: OrderType;
  onOrderTypeChange: (type: string) => void;
}

export function OrderTypeSelector({ orderType, onOrderTypeChange }: OrderTypeSelectorProps) {
  const orderTypeOptions = [
    {
      value: 'balcao',
      label: 'Pedido Balcão',
      icon: Store,
      description: 'Consumo no local (balcão)'
    },
    {
      value: 'entrega',
      label: 'Entrega',
      icon: Truck,
      description: 'Delivery para o cliente'
    },
    {
      value: 'retirada',
      label: 'Retirada',
      icon: Package,
      description: 'Cliente retira no local'
    },
    {
      value: 'mesa',
      label: 'Mesa',
      icon: Users,
      description: 'Atendimento em mesa'
    }
  ];

  return (
    <div>
      <Label className="text-slate-300 text-sm font-medium mb-3 block">Tipo de Pedido</Label>
      <div className="space-y-2">
        {orderTypeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = orderType === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onOrderTypeChange(option.value)}
              className={`
                w-full p-3 rounded-lg border text-left transition-all duration-200
                ${isSelected 
                  ? 'border-amber-500 bg-amber-500/10 text-white' 
                  : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-slate-400">{option.description}</div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
