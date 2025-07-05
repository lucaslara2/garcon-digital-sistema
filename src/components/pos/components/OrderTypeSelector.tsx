
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
      <Label className="text-gray-700 text-sm font-medium">Tipo de Pedido</Label>
      <Select value={orderType} onValueChange={onOrderTypeChange}>
        <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-10">
          <div className="flex items-center space-x-3">
            {selectedOption && (
              <>
                <selectedOption.icon className="h-4 w-4 text-blue-600" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{selectedOption.label}</span>
                  <span className="text-xs text-gray-500">{selectedOption.description}</span>
                </div>
              </>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200">
          {orderTypeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 py-3"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
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
