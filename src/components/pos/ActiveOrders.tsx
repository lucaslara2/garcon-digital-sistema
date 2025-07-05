
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, CheckCircle, Timer, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface Order {
  id: string;
  customer_name: string;
  table_id: string | null;
  order_type: string;
  status: OrderStatus;
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
    refetchInterval: 5000
  });

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      refetch();
      toast.success(`Pedido ${newStatus === 'preparing' ? 'aceito e em preparo' : 'finalizado'}!`);
    } catch (error: any) {
      toast.error('Erro ao atualizar pedido: ' + error.message);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
  };

  const pendingOrders = activeOrders?.filter(order => order.status === 'pending') || [];
  const preparingOrders = activeOrders?.filter(order => order.status === 'preparing') || [];

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 h-full flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-400" />
          Pedidos Ativos
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Novos Pedidos */}
        {pendingOrders.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Novos Pedidos ({pendingOrders.length})
            </h3>
            <div className="space-y-2">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrderId === order.id 
                      ? 'border-amber-500 bg-amber-900/20' 
                      : 'border-slate-700 bg-slate-800 hover:border-amber-500/50'
                  }`}
                  onClick={() => onOrderSelect(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400 border-yellow-500/40 text-xs">
                        <Timer className="h-3 w-3 mr-1" />
                        {formatTimeAgo(order.created_at)}
                      </Badge>
                      <span className="text-white font-medium text-sm">#{order.id.slice(-6)}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'preparing');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3"
                    >
                      <ChefHat className="h-3 w-3 mr-1" />
                      Aceitar
                    </Button>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">{order.customer_name}</span>
                      <span className="font-bold text-amber-400">R$ {order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-slate-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {order.restaurant_tables?.table_number 
                          ? `Mesa ${order.restaurant_tables.table_number}`
                          : 'Balcão'
                        }
                      </span>
                      <span className="mx-2">•</span>
                      <span>{order.order_items.length} itens</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Em Preparo */}
        {preparingOrders.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center">
              <ChefHat className="h-4 w-4 mr-1" />
              Em Preparo ({preparingOrders.length})
            </h3>
            <div className="space-y-2">
              {preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrderId === order.id 
                      ? 'border-amber-500 bg-amber-900/20' 
                      : 'border-slate-700 bg-slate-800 hover:border-amber-500/50'
                  }`}
                  onClick={() => onOrderSelect(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-500/40 text-xs">
                        <ChefHat className="h-3 w-3 mr-1" />
                        {formatTimeAgo(order.created_at)}
                      </Badge>
                      <span className="text-white font-medium text-sm">#{order.id.slice(-6)}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'ready');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pronto
                    </Button>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">{order.customer_name}</span>
                      <span className="font-bold text-amber-400">R$ {order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-slate-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {order.restaurant_tables?.table_number 
                          ? `Mesa ${order.restaurant_tables.table_number}`
                          : 'Balcão'
                        }
                      </span>
                      <span className="mx-2">•</span>
                      <span>{order.order_items.length} itens</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeOrders?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Clock className="h-12 w-12 mb-4 text-slate-600" />
            <p className="text-lg font-medium mb-2">Nenhum pedido ativo</p>
            <p className="text-sm text-slate-500">Novos pedidos aparecerão aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
