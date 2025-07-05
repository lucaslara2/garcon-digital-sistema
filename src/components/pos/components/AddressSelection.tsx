
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import { Client, OrderType } from '../types/orderTypes';

interface AddressSelectionProps {
  orderType: OrderType;
  selectedClient: Client | null;
  selectedAddressId: string;
  deliveryAddress: string;
  showNewAddressForm: boolean;
  onAddressSelect: (addressId: string) => void;
  onDeliveryAddressChange: (address: string) => void;
  onToggleNewAddressForm: () => void;
}

export function AddressSelection({
  orderType,
  selectedClient,
  selectedAddressId,
  deliveryAddress,
  showNewAddressForm,
  onAddressSelect,
  onDeliveryAddressChange,
  onToggleNewAddressForm
}: AddressSelectionProps) {
  if (orderType !== 'entrega') {
    return null;
  }

  return (
    <div>
      <Label className="text-slate-300 text-sm font-medium flex items-center">
        <MapPin className="h-4 w-4 mr-1" />
        Endereço de Entrega
        <span className="text-red-400 ml-1">*</span>
      </Label>

      {/* Endereços Salvos */}
      {selectedClient && selectedClient.addresses && selectedClient.addresses.length > 0 && (
        <div className="mt-2 mb-3">
          <Label className="text-slate-400 text-xs">Endereços Salvos:</Label>
          <div className="space-y-2 mt-1">
            {selectedClient.addresses.map((address) => (
              <button
                key={address.id}
                onClick={() => onAddressSelect(address.id)}
                className={`
                  w-full p-2 rounded-md border text-left text-xs transition-colors
                  ${selectedAddressId === address.id
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                  }
                `}
              >
                <div className="font-medium">{address.label}</div>
                <div className="text-slate-400 truncate">{address.address}</div>
                {address.is_default && (
                  <div className="text-amber-400 text-xs">Padrão</div>
                )}
              </button>
            ))}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleNewAddressForm}
            className="mt-2 text-xs bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            Novo Endereço
          </Button>
        </div>
      )}

      {/* Campo de Endereço */}
      {(!selectedClient || showNewAddressForm || selectedClient.addresses.length === 0) && (
        <Input
          value={deliveryAddress}
          onChange={(e) => onDeliveryAddressChange(e.target.value)}
          placeholder="Endereço completo para entrega"
          className="bg-slate-800 border-slate-700 text-white mt-1"
          required
        />
      )}
    </div>
  );
}
