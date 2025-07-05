
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Printer, Clock, User, MapPin } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name: string;
  };
  notes?: string;
  order_item_addons?: Array<{
    product_addons: {
      name: string;
    };
    total_price: number;
    quantity: number;
  }>;
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
  delivery_instructions?: string;
  customer_phone?: string;
}

interface OrderTicketProps {
  order: Order | null;
}

export function OrderTicket({ order }: OrderTicketProps) {
  if (!order) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 h-full shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-blue-600" />
            Comanda do Pedido
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Receipt className="h-12 w-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Selecione um pedido</p>
          <p className="text-sm text-gray-500">Clique em um pedido para ver a comanda</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const handlePrint = () => {
    const printContent = `
=================================
        RESTAURANTE
=================================
COMANDA #${order.id.slice(-8)}
Data: ${new Date(order.created_at).toLocaleString('pt-BR')}

CLIENTE: ${order.customer_name}
${order.customer_phone ? `TELEFONE: ${order.customer_phone}` : ''}
LOCAL: ${order.restaurant_tables?.table_number 
  ? `Mesa ${order.restaurant_tables.table_number}`
  : 'Balcão'
}

---------------------------------
ITENS:
${order.order_items.map((item: any) => {
  let itemText = `${item.quantity}x ${item.products.name} - R$ ${item.total_price.toFixed(2)}`;
  if (item.notes) itemText += `\n   Obs: ${item.notes}`;
  if (item.order_item_addons?.length > 0) {
    itemText += '\n   Adicionais:';
    item.order_item_addons.forEach((addon: any) => {
      itemText += `\n   - ${addon.product_addons.name} (+R$ ${addon.total_price.toFixed(2)})`;
    });
  }
  return itemText;
}).join('\n')}

---------------------------------
SUBTOTAL: R$ ${order.subtotal.toFixed(2)}
TOTAL: R$ ${order.total.toFixed(2)}

${order.delivery_instructions ? `INSTRUÇÕES:\n${order.delivery_instructions}` : ''}

=================================
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comanda #${order.id.slice(-8)}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 20px; 
                line-height: 1.4;
              }
              pre { 
                white-space: pre-wrap; 
                margin: 0;
              }
            </style>
          </head>
          <body>
            <pre>${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col shadow-sm">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-blue-600" />
            Comanda do Pedido
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir</span>
          </Button>
        </div>
      </div>

      {/* Conteúdo da Comanda */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Estilo de Comanda de Restaurante */}
        <div className="max-w-sm mx-auto bg-white border-2 border-dashed border-gray-300 p-4 font-mono text-sm">
          {/* Cabeçalho da Comanda */}
          <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
            <h3 className="text-lg font-bold">RESTAURANTE</h3>
            <div className="text-xs text-gray-600 mt-1">
              {new Date(order.created_at).toLocaleString('pt-BR')}
            </div>
          </div>

          {/* Número do Pedido */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold">COMANDA</div>
            <div className="text-xl font-bold">#{order.id.slice(-8)}</div>
            <Badge className={`mt-2 ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </Badge>
          </div>

          {/* Informações do Cliente */}
          <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
            <div className="flex justify-between mb-1">
              <span>CLIENTE:</span>
              <span className="font-bold">{order.customer_name}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>LOCAL:</span>
              <span className="font-bold">
                {order.restaurant_tables?.table_number 
                  ? `Mesa ${order.restaurant_tables.table_number}`
                  : 'Balcão'
                }
              </span>
            </div>
            {order.customer_phone && (
              <div className="flex justify-between mb-1">
                <span>FONE:</span>
                <span className="font-bold">{order.customer_phone}</span>
              </div>
            )}
          </div>

          {/* Lista de Itens */}
          <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
            <div className="font-bold mb-2">ITENS:</div>
            {order.order_items.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between">
                  <span>{item.quantity}x {item.products.name}</span>
                  <span>R$ {item.total_price.toFixed(2)}</span>
                </div>
                {item.notes && (
                  <div className="text-xs text-gray-600 ml-2 mt-1">
                    Obs: {item.notes}
                  </div>
                )}
                {item.order_item_addons?.map((addon, addonIndex) => (
                  <div key={addonIndex} className="text-xs text-gray-600 ml-2">
                    + {addon.product_addons.name} (R$ {addon.total_price.toFixed(2)})
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
            <div className="flex justify-between mb-1">
              <span>SUBTOTAL:</span>
              <span>R$ {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL:</span>
              <span>R$ {order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Instruções */}
          {order.delivery_instructions && (
            <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
              <div className="font-bold mb-1">INSTRUÇÕES:</div>
              <div className="text-xs">{order.delivery_instructions}</div>
            </div>
          )}

          {/* Rodapé */}
          <div className="text-center text-xs text-gray-600">
            <div>Obrigado pela preferência!</div>
            <div className="mt-2">
              <Clock className="h-3 w-3 inline mr-1" />
              {new Date(order.created_at).toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
