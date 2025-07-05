
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Store, Truck, Package } from 'lucide-react';

interface Table {
  id: string;
  table_number: number;
  seats: number;
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
  const [orderType, setOrderType] = React.useState<'balcao' | 'entrega' | 'retirada' | 'mesa'>('balcao');

  const handleOrderTypeChange = (value: string) => {
    setOrderType(value as 'balcao' | 'entrega' | 'retirada' | 'mesa');
    if (value !== 'mesa') {
      setSelectedTable(value);
    } else {
      setSelectedTable('');
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
        {/* Tipo de Pedido */}
        <div>
          <Label className="text-slate-300 text-sm font-medium mb-3 block">Tipo de Pedido</Label>
          <RadioGroup 
            value={orderType} 
            onValueChange={handleOrderTypeChange}
            className="grid grid-cols-2 gap-3"
          >
            {orderTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="border-slate-600 text-amber-400"
                  />
                  <label 
                    htmlFor={option.value} 
                    className="flex items-center space-x-2 cursor-pointer flex-1 p-2 rounded-md hover:bg-slate-800/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{option.label}</div>
                      <div className="text-xs text-slate-400">{option.description}</div>
                    </div>
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Seleção de Mesa (apenas quando tipo = mesa) */}
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

        {/* Nome do Cliente */}
        <div>
          <Label className="text-slate-300 text-sm font-medium">
            Nome do Cliente
            {orderType === 'entrega' && <span className="text-red-400 ml-1">*</span>}
          </Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={
              orderType === 'balcao' ? "Nome do cliente (opcional)" :
              orderType === 'entrega' ? "Nome para entrega (obrigatório)" :
              orderType === 'retirada' ? "Nome para retirada" :
              "Nome do cliente"
            }
            className="bg-slate-800 border-slate-700 text-white mt-1"
            required={orderType === 'entrega'}
          />
        </div>

        {/* Informações adicionais por tipo */}
        {orderType === 'entrega' && (
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-300 text-sm">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Entrega</span>
            </div>
            <p className="text-blue-200 text-xs mt-1">
              Será necessário informar o endereço de entrega
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
