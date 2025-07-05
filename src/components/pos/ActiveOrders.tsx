
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { GradientCard } from '@/components/ui/gradient-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, Eye, CheckCircle, Timer, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

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

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
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

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Pedidos Pendentes */}
      <div className="flex-1">
        <GradientCard 
          title={`Pendentes (${pendingOrders.length})`}
          icon={<Clock className="h-5 w-5" />}
          gradient="warning"
          className="h-full flex flex-col"
        >
          {pendingOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="bg-slate-700/50 p-4 rounded-full mb-3">
                <Clock className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-sm">Nenhum pedido pendente</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${
                    selectedOrderId === order.id 
                      ? 'border-amber-500 bg-gradient-to-r from-amber-900/30 to-orange-900/30' 
                      : 'border-slate-600/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:border-amber-500/50'
                  }`}
                  onClick={() => onOrderSelect(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        <Timer className="h-3 w-3 mr-1" />
                        {formatTimeAgo(order.created_at)}
                      </Badge>
                      <span className="text-white font-medium text-sm">
                        #{order.id.slice(-6)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'preparing');
                      }}
                      className="bg-blue-600/80 hover:bg-blue-600 text-white text-xs h-7 px-2"
                    >
                      <ChefHat className="h-3 w-3 mr-1" />
                      Aceitar
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {order.restaurant_tables?.table_number 
                            ? `Mesa ${order.restaurant_tables.table_number}`
                            : 'Balcão'
                          }
                        </span>
                      </div>
                      <span className="font-bold text-amber-400">R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GradientCard>
      </div>

      {/* Pedidos em Preparo */}
      <div className="flex-1">
        <GradientCard 
          title={`Em Preparo (${preparingOrders.length})`}
          icon={<ChefHat className="h-5 w-5" />}
          className="h-full flex flex-col"
        >
          {preparingOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="bg-slate-700/50 p-4 rounded-full mb-3">
                <ChefHat className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-sm">Nenhum pedido em preparo</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${
                    selectedOrderId === order.id 
                      ? 'border-amber-500 bg-gradient-to-r from-amber-900/30 to-orange-900/30' 
                      : 'border-slate-600/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50 hover:border-amber-500/50'
                  }`}
                  onClick={() => onOrderSelect(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <ChefHat className="h-3 w-3 mr-1" />
                        {formatTimeAgo(order.created_at)}
                      </Badge>
                      <span className="text-white font-medium text-sm">
                        #{order.id.slice(-6)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'ready');
                      }}
                      className="bg-green-600/80 hover:bg-green-600 text-white text-xs h-7 px-2"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pronto
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {order.restaurant_tables?.table_number 
                            ? `Mesa ${order.restaurant_tables.table_number}`
                            : 'Balcão'
                          }
                        </span>
                      </div>
                      <span className="font-bold text-amber-400">R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GradientCard>
      </div>
    </div>
  );
}
