
import React from 'react';
import { GradientCard } from '@/components/ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Receipt, Printer, Clock, User, MapPin } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name: string;
  };
}

interface Order {
  id: string;
  customer_name: string;
  table_id: string | null;
  order_type: string;
  status: string;
  total: number;
  subtotal: number;
  created_at: string;
  restaurant_tables?: {
    table_number: number;
  };
  order_items: OrderItem[];
}

interface OrderTicketProps {
  order: Order | null;
}

export function OrderTicket({ order }: OrderTicketProps) {
  if (!order) {
    return (
      <GradientCard 
        title="Comanda do Pedido" 
        icon={<Receipt className="h-5 w-5" />}
        className="animate-fade-in h-full"
      >
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Receipt className="h-16 w-16 mb-4 text-slate-600" />
          <p className="text-lg mb-2">Selecione um pedido</p>
          <p className="text-sm">Clique em um pedido para ver a comanda</p>
        </div>
      </GradientCard>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      default: return status;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <GradientCard 
      title="Comanda do Pedido" 
      icon={<Receipt className="h-5 w-5" />}
      className="animate-fade-in h-full"
    >
      <div className="space-y-4">
        {/* Cabeçalho da Comanda */}
        <div className="text-center border-b border-slate-600 pb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            PEDIDO #{order.id.slice(-8)}
          </h3>
          <Badge className={`${getStatusColor(order.status)} text-white mb-2`}>
            {getStatusText(order.status)}
          </Badge>
          <div className="text-sm text-slate-300 space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <User className="h-4 w-4" />
            <span><strong>Cliente:</strong> {order.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <MapPin className="h-4 w-4" />
            <span><strong>Local:</strong> {
              order.restaurant_tables?.table_number 
                ? `Mesa ${order.restaurant_tables.table_number}`
                : 'Balcão'
            }</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Receipt className="h-4 w-4" />
            <span><strong>Tipo:</strong> {
              order.order_type === 'dine_in' ? 'No Local' : 
              order.order_type === 'takeout' ? 'Retirada' : 'Delivery'
            }</span>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Itens do Pedido */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Itens do Pedido:</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-3 bg-slate-700/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-white">{item.products.name}</div>
                  <div className="text-sm text-slate-400">
                    {item.quantity}x R$ {item.unit_price.toFixed(2)}
                  </div>
                </div>
                <div className="font-bold text-amber-400">
                  R$ {item.total_price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Total */}
        <div className="space-y-2">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal:</span>
            <span>R$ {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-white">
            <span>Total:</span>
            <span className="text-amber-400">R$ {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Botão de Imprimir */}
        <div className="pt-4">
          <Button
            onClick={handlePrint}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Comanda
          </Button>
        </div>
      </div>
    </GradientCard>
  );
}
