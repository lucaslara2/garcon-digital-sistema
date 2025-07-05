
import React from 'react';
import { Truck, Package } from 'lucide-react';
import { OrderType } from '../types/orderTypes';

interface OrderTypeInfoProps {
  orderType: OrderType;
}

export function OrderTypeInfo({ orderType }: OrderTypeInfoProps) {
  if (orderType === 'entrega') {
    return (
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-blue-300 text-sm">
          <Truck className="h-4 w-4" />
          <span className="font-medium">Entrega</span>
        </div>
        <p className="text-blue-200 text-xs mt-1">
          Preencha todos os dados obrigatórios para delivery
        </p>
      </div>
    );
  }

  if (orderType === 'retirada') {
    return (
      <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-green-300 text-sm">
          <Package className="h-4 w-4" />
          <span className="font-medium">Retirada</span>
        </div>
        <p className="text-green-200 text-xs mt-1">
          Cliente retirará o pedido no balcão
        </p>
      </div>
    );
  }

  return null;
}
