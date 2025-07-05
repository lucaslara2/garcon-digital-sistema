
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { OrderType } from '../types/orderTypes';

interface ClientSearchProps {
  orderType: OrderType;
  customerPhone: string;
  onPhoneChange: (phone: string) => void;
  hasSelectedClient: boolean;
}

export function ClientSearch({ 
  orderType, 
  customerPhone, 
  onPhoneChange, 
  hasSelectedClient 
}: ClientSearchProps) {
  if (orderType !== 'entrega' && orderType !== 'retirada') {
    return null;
  }

  return (
    <div>
      <Label className="text-slate-300 text-sm font-medium flex items-center">
        <Phone className="h-4 w-4 mr-1" />
        Telefone do Cliente
        {orderType === 'entrega' && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <Input
        value={customerPhone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="(00) 00000-0000"
        className="bg-slate-800 border-slate-700 text-white mt-1"
        required={orderType === 'entrega'}
      />
      {customerPhone.length >= 10 && !hasSelectedClient && (
        <p className="text-xs text-slate-400 mt-1">
          Nenhum cliente encontrado com este telefone
        </p>
      )}
    </div>
  );
}
