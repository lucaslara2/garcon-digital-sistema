
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GradientCard } from '@/components/ui/gradient-card';
import { Users, User } from 'lucide-react';

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
    <GradientCard 
      title="Detalhes do Pedido" 
      icon={<Users className="h-5 w-5" />}
      className="animate-fade-in"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="table-select" className="text-slate-300 text-sm font-medium">
            Mesa (opcional)
          </Label>
          <Select value={selectedTable} onValueChange={setSelectedTable}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1">
              <SelectValue placeholder="Pedido Balcão" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="">Pedido Balcão</SelectItem>
              {tables?.map((table) => (
                <SelectItem key={table.id} value={table.id} className="text-white">
                  Mesa {table.table_number} ({table.seats} lugares)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="customer-name" className="text-slate-300 text-sm font-medium">
            Nome do Cliente
          </Label>
          <Input
            id="customer-name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nome do cliente"
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 mt-1"
          />
        </div>
      </div>
    </GradientCard>
  );
}
