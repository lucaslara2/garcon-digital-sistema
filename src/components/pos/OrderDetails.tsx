
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, Store, Truck, Package, Phone, MapPin, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface Table {
  id: string;
  table_number: number;
  seats: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  addresses: {
    id: string;
    address: string;
    label: string;
    is_default: boolean;
  }[];
}

interface OrderDetailsProps {
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tables: Table[] | undefined;
}

export function OrderDetails({ 
  selectedTable, 
  setSelectedTable, 
  customerName, 
  setCustomerName, 
  tables 
}: OrderDetailsProps) {
  const { userProfile } = useAuth();
  const [orderType, setOrderType] = useState<'balcao' | 'entrega' | 'retirada' | 'mesa'>('balcao');
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
      setSelectedClient(clientData as Client);
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
    setOrderType(type as 'balcao' | 'entrega' | 'retirada' | 'mesa');
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
    <div className="bg-slate-900 rounded-lg border border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-amber-400" />
          Detalhes do Pedido
        </h2>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Tipo de Pedido - Lista */}
        <div>
          <Label className="text-slate-300 text-sm font-medium mb-3 block">Tipo de Pedido</Label>
          <div className="space-y-2">
            {orderTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = orderType === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleOrderTypeChange(option.value)}
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
        {(orderType === 'entrega' || orderType === 'retirada') && (
          <div>
            <Label className="text-slate-300 text-sm font-medium flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              Telefone do Cliente
              {orderType === 'entrega' && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <Input
              value={customerPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(00) 00000-0000"
              className="bg-slate-800 border-slate-700 text-white mt-1"
              required={orderType === 'entrega'}
            />
            {customerPhone.length >= 10 && !selectedClient && (
              <p className="text-xs text-slate-400 mt-1">
                Nenhum cliente encontrado com este telefone
              </p>
            )}
          </div>
        )}

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
        {orderType === 'entrega' && (
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
                      onClick={() => handleAddressSelect(address.id)}
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
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
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
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Endereço completo para entrega"
                className="bg-slate-800 border-slate-700 text-white mt-1"
                required
              />
            )}
          </div>
        )}

        {/* Informações adicionais por tipo */}
        {orderType === 'entrega' && (
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-300 text-sm">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Entrega</span>
            </div>
            <p className="text-blue-200 text-xs mt-1">
              Preencha todos os dados obrigatórios para delivery
            </p>
          </div>
        )}

        {orderType === 'retirada' && (
          <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-300 text-sm">
              <Package className="h-4 w-4" />
              <span className="font-medium">Retirada</span>
            </div>
            <p className="text-green-200 text-xs mt-1">
              Cliente retirará o pedido no balcão
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
