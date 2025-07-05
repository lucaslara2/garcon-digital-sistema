
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { OrderTypeSelector } from './components/OrderTypeSelector';
import { ClientSearch } from './components/ClientSearch';
import { AddressSelection } from './components/AddressSelection';
import { OrderTypeInfo } from './components/OrderTypeInfo';
import { OrderDetailsProps, Client, OrderType } from './types/orderTypes';

export function OrderDetails({ 
  selectedTable, 
  setSelectedTable, 
  customerName, 
  setCustomerName, 
  tables 
}: OrderDetailsProps) {
  const { userProfile } = useAuth();
  const [orderType, setOrderType] = useState<OrderType>('balcao');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Buscar cliente por telefone
  const { data: clientData, refetch: searchClient } = useQuery({
    queryKey: ['client-by-phone', customerPhone, userProfile?.restaurant_id],
    queryFn: async () => {
      if (!customerPhone || customerPhone.length < 10) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone,
          client_addresses!inner (
            id,
            address,
            label,
            is_default
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('phone', customerPhone)
        .single();

      if (error) return null;
      return data;
    },
    enabled: false
  });

  useEffect(() => {
    if (clientData) {
      // Transform the data to match the Client interface
      const transformedClient: Client = {
        id: clientData.id,
        name: clientData.name,
        phone: clientData.phone,
        addresses: clientData.client_addresses || []
      };
      
      setSelectedClient(transformedClient);
      setCustomerName(clientData.name);
      
      // Selecionar endereço padrão se existir
      const defaultAddress = clientData.client_addresses?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setDeliveryAddress(defaultAddress.address);
      }
    }
  }, [clientData, setCustomerName]);

  const handleOrderTypeChange = (type: string) => {
    setOrderType(type as OrderType);
    if (type !== 'mesa') {
      setSelectedTable(type);
    } else {
      setSelectedTable('');
    }
    
    // Reset campos quando muda tipo
    if (type !== 'entrega') {
      setDeliveryAddress('');
      setSelectedAddressId('');
    }
  };

  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      searchClient();
    } else {
      setSelectedClient(null);
      setSelectedAddressId('');
      setDeliveryAddress('');
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = selectedClient?.addresses.find(addr => addr.id === addressId);
    if (address) {
      setDeliveryAddress(address.address);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-amber-400" />
          Detalhes do Pedido
        </h2>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Tipo de Pedido */}
        <OrderTypeSelector 
          orderType={orderType}
          onOrderTypeChange={handleOrderTypeChange}
        />

        {/* Seleção de Mesa */}
        {orderType === 'mesa' && (
          <div>
            <Label className="text-slate-300 text-sm font-medium">Mesa</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                <SelectValue placeholder="Selecione a mesa" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {tables?.map((table) => (
                  <SelectItem key={table.id} value={table.id} className="text-white">
                    Mesa {table.table_number} ({table.seats} lugares)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Telefone do Cliente */}
        <ClientSearch
          orderType={orderType}
          customerPhone={customerPhone}
          onPhoneChange={handlePhoneChange}
          hasSelectedClient={!!selectedClient}
        />

        {/* Nome do Cliente */}
        {(orderType !== 'balcao') && (
          <div>
            <Label className="text-slate-300 text-sm font-medium">
              Nome do Cliente
              {orderType === 'entrega' && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={
                orderType === 'entrega' ? "Nome para entrega (obrigatório)" :
                orderType === 'retirada' ? "Nome para retirada" :
                "Nome do cliente"
              }
              className="bg-slate-800 border-slate-700 text-white mt-1"
              required={orderType === 'entrega'}
            />
          </div>
        )}

        {/* Endereço para Entrega */}
        <AddressSelection
          orderType={orderType}
          selectedClient={selectedClient}
          selectedAddressId={selectedAddressId}
          deliveryAddress={deliveryAddress}
          showNewAddressForm={showNewAddressForm}
          onAddressSelect={handleAddressSelect}
          onDeliveryAddressChange={setDeliveryAddress}
          onToggleNewAddressForm={() => setShowNewAddressForm(!showNewAddressForm)}
        />

        {/* Informações adicionais por tipo */}
        <OrderTypeInfo orderType={orderType} />
      </div>
    </div>
  );
}
