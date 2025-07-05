
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { GradientCard } from '@/components/ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_name: string;
  table_id: string | null;
  order_type: string;
  status: string;
  total: number;
  created_at: string;
  restaurant_tables?: {
    table_number: number;
  };
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
    };
  }[];
}

interface ActiveOrdersProps {
  onOrderSelect: (order: Order) => void;
  selectedOrderId: string | null;
}

export function ActiveOrders({ onOrderSelect, selectedOrderId }: ActiveOrdersProps) {
  const { userProfile } = useAuth();

  const { data: activeOrders, refetch } = useQuery({
    queryKey: ['active-orders', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant_tables(table_number),
          order_items(
            id,
            quantity,
            unit_price,
            total_price,
            products(name)
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!userProfile?.restaurant_id,
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      refetch();
      toast.success(`Pedido ${newStatus === 'preparing' ? 'aceito' : 'finalizado'}!`);
    } catch (error: any) {
      toast.error('Erro ao atualizar pedido: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      default: return status;
    }
  };

  const pendingOrders = activeOrders?.filter(order => order.status === 'pending') || [];
  const preparingOrders = activeOrders?.filter(order => order.status === 'preparing') || [];

  return (
    <div className="space-y-6">
      {/* Pedidos Pendentes */}
      <GradientCard 
        title="Pedidos Pendentes" 
        icon={<Clock className="h-5 w-5" />}
        gradient="warning"
        className="animate-fade-in"
      >
        {pendingOrders.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <Clock className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <p>Nenhum pedido pendente</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className={`p-4 bg-slate-700/50 rounded-lg border transition-all cursor-pointer ${
                  selectedOrderId === order.id 
                    ? 'border-amber-500 bg-slate-700' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => onOrderSelect(order)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                    <span className="text-white font-medium">
                      Pedido #{order.id.slice(-8)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'preparing');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ChefHat className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <p><strong>Cliente:</strong> {order.customer_name}</p>
                  <p><strong>Mesa:</strong> {
                    order.restaurant_tables?.table_number 
                      ? `Mesa ${order.restaurant_tables.table_number}`
                      : 'Balcão'
                  }</p>
                  <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
                  <p><strong>Horário:</strong> {new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GradientCard>

      {/* Pedidos em Preparo */}
      <GradientCard 
        title="Pedidos em Preparo" 
        icon={<ChefHat className="h-5 w-5" />}
        className="animate-fade-in"
      >
        {preparingOrders.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <ChefHat className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <p>Nenhum pedido em preparo</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {preparingOrders.map((order) => (
              <div
                key={order.id}
                className={`p-4 bg-slate-700/50 rounded-lg border transition-all cursor-pointer ${
                  selectedOrderId === order.id 
                    ? 'border-amber-500 bg-slate-700' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => onOrderSelect(order)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(order.status)} text-white`}>
                      {getStatusText(order.status)}
                    </Badge>
                    <span className="text-white font-medium">
                      Pedido #{order.id.slice(-8)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'ready');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Pronto
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <p><strong>Cliente:</strong> {order.customer_name}</p>
                  <p><strong>Mesa:</strong> {
                    order.restaurant_tables?.table_number 
                      ? `Mesa ${order.restaurant_tables.table_number}`
                      : 'Balcão'
                  }</p>
                  <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
                  <p><strong>Horário:</strong> {new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GradientCard>
    </div>
  );
}
