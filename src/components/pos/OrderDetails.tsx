
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';

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
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-amber-400" />
          Detalhes do Pedido
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <Label className="text-slate-300 text-sm font-medium">Mesa</Label>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
              <SelectValue placeholder="Selecione a mesa" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="balcao" className="text-white">Pedido Balcão</SelectItem>
              {tables?.map((table) => (
                <SelectItem key={table.id} value={table.id} className="text-white">
                  Mesa {table.table_number} ({table.seats} lugares)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-300 text-sm font-medium">Nome do Cliente</Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Digite o nome do cliente"
            className="bg-slate-800 border-slate-700 text-white mt-1"
          />
        </div>
      </div>
    </div>
  );
}
