import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  ChefHat, 
  Truck, 
  CheckCircle, 
  X, 
  Printer, 
  MapPin, 
  Phone,
  User,
  DollarSign
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

const OrdersManagement = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Buscar pedidos por status
  const { data: pendingOrders } = useQuery({
    queryKey: ['orders', 'pending', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, price),
            order_item_addons(
              *,
              product_addons(name, price)
            )
          ),
          payments(payment_method, status)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.restaurant_id,
    refetchInterval: 5000 // Atualizar a cada 5 segundos
  });

  const { data: preparingOrders } = useQuery({
    queryKey: ['orders', 'preparing', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, price),
            order_item_addons(
              *,
              product_addons(name, price)
            )
          ),
          payments(payment_method, status)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('status', 'preparing')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.restaurant_id,
    refetchInterval: 5000
  });

  const { data: readyOrders } = useQuery({
    queryKey: ['orders', 'ready', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, price),
            order_item_addons(
              *,
              product_addons(name, price)
            )
          ),
          payments(payment_method, status)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('status', 'ready')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.restaurant_id,
    refetchInterval: 5000
  });

  // Atualizar status do pedido
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          printed_at: status === 'preparing' ? new Date().toISOString() : undefined
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Status do pedido atualizado!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar pedido: ' + error.message);
    }
  });

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus.mutate({ orderId, status: 'preparing' });
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderStatus.mutate({ orderId, status: 'cancelled' });
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus.mutate({ orderId, status: 'ready' });
  };

  const handleMarkDelivered = (orderId: string) => {
    updateOrderStatus.mutate({ orderId, status: 'delivered' });
  };

  const handlePrintOrder = (order: any) => {
    // Função para imprimir pedido - pode ser integrada com impressora
    const printContent = `
=================================
        ${order.restaurant?.name || 'RESTAURANTE'}
=================================
PEDIDO #${order.id.slice(-8)}
Data: ${new Date(order.created_at).toLocaleString('pt-BR')}

CLIENTE: ${order.customer_name}
TELEFONE: ${order.customer_phone}
ENDEREÇO: ${order.delivery_address}

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
TOTAL: R$ ${order.total.toFixed(2)}
PAGAMENTO: ${order.payments?.[0]?.payment_method || 'Não definido'}

${order.delivery_instructions || ''}

=================================
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Pedido #${order.id.slice(-8)}</title>
            <style>
              body { font-family: monospace; font-size: 12px; margin: 20px; }
              pre { white-space: pre-wrap; }
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

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes === 1) return '1 min atrás';
    return `${minutes} min atrás`;
  };

  const OrderCard = ({ order, actions }: { order: any; actions: React.ReactNode }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge className={`text-xs ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </Badge>
            <span className="text-sm font-medium">#{order.id.slice(-8)}</span>
            <span className="text-xs text-gray-500">{formatTimeAgo(order.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrintOrder(order)}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Informações do Cliente */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{order.customer_phone}</span>
            </div>
          </div>

          {/* Endereço */}
          {order.delivery_address && (
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <span className="text-gray-600">{order.delivery_address}</span>
            </div>
          )}

          {/* Itens do Pedido */}
          <div className="space-y-2">
            {order.order_items.map((item: any, index: number) => (
              <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                <div className="flex justify-between">
                  <span>{item.quantity}x {item.products.name}</span>
                  <span className="font-medium">R$ {item.total_price.toFixed(2)}</span>
                </div>
                {item.notes && (
                  <div className="text-xs text-gray-600 mt-1">Obs: {item.notes}</div>
                )}
                {item.order_item_addons?.map((addon: any, addonIndex: number) => (
                  <div key={addonIndex} className="text-xs text-gray-600 ml-4">
                    + {addon.product_addons.name} (R$ {addon.total_price.toFixed(2)})
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Total e Pagamento */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-bold text-green-600">R$ {order.total.toFixed(2)}</span>
            </div>
            <span className="text-xs text-gray-500">
              {order.payments?.[0]?.payment_method === 'cash' ? 'Dinheiro' :
               order.payments?.[0]?.payment_method === 'credit_card' ? 'Cartão' :
               order.payments?.[0]?.payment_method === 'pix' ? 'PIX' : 'N/A'}
            </span>
          </div>

          {/* Instruções de Entrega */}
          {order.delivery_instructions && (
            <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
              <strong>Instruções:</strong> {order.delivery_instructions}
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            {actions}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Pedidos</h1>
        <p className="text-gray-600">Acompanhe e gerencie todos os pedidos em tempo real</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pendentes ({pendingOrders?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="preparing" className="flex items-center space-x-2">
            <ChefHat className="h-4 w-4" />
            <span>Preparando ({preparingOrders?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Prontos ({readyOrders?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4">
            {pendingOrders?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido pendente</p>
                </CardContent>
              </Card>
            ) : (
              pendingOrders?.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actions={
                    <>
                      <Button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        size="sm"
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectOrder(order.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Recusar
                      </Button>
                    </>
                  }
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="preparing" className="mt-6">
          <div className="grid gap-4">
            {preparingOrders?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido em preparo</p>
                </CardContent>
              </Card>
            ) : (
              preparingOrders?.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actions={
                    <Button
                      onClick={() => handleMarkReady(order.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Pronto
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="ready" className="mt-6">
          <div className="grid gap-4">
            {readyOrders?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum pedido pronto para entrega</p>
                </CardContent>
              </Card>
            ) : (
              readyOrders?.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  actions={
                    <Button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Entregue
                    </Button>
                  }
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdersManagement;
