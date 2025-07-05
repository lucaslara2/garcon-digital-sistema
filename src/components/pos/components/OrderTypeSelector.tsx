
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const selectedOption = orderTypeOptions.find(option => option.value === orderType);

  return (
    <div className="space-y-2">
      <Label className="text-slate-300 text-sm font-medium">Tipo de Pedido</Label>
      <Select value={orderType} onValueChange={onOrderTypeChange}>
        <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-12">
          <div className="flex items-center space-x-3">
            {selectedOption && (
              <>
                <selectedOption.icon className="h-4 w-4 text-amber-400" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{selectedOption.label}</span>
                  <span className="text-xs text-slate-400">{selectedOption.description}</span>
                </div>
              </>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          {orderTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-white hover:bg-slate-700 focus:bg-slate-700 py-3"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4 text-amber-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-slate-400">{option.description}</span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
