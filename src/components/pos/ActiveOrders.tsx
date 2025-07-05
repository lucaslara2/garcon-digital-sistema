
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { GradientCard } from '@/components/ui/gradient-card';
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

  const getUrgencyColor = (dateString: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (minutes > 15) return 'text-red-400 bg-red-900/30 border-red-500/50';
    if (minutes > 10) return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
    return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
  };

  const pendingOrders = activeOrders?.filter(order => order.status === 'pending') || [];
  const preparingOrders = activeOrders?.filter(order => order.status === 'preparing') || [];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Pedidos Pendentes Premium */}
      <div className="flex-1">
        <GradientCard 
          title={`Novos Pedidos • ${pendingOrders.length}`}
          icon={<AlertCircle className="h-5 w-5" />}
          gradient="warning"
          className="h-full flex flex-col shadow-2xl border-amber-500/30"
        >
          {pendingOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-2xl mb-4 border border-slate-600/30">
                <Clock className="h-10 w-10 text-slate-500" />
              </div>
              <p className="font-medium mb-1">Nenhum pedido pendente</p>
              <p className="text-sm text-slate-500">Aguardando novos pedidos...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] shadow-lg backdrop-blur-sm ${
                    selectedOrderId === order.id 
                      ? 'border-amber-500 bg-gradient-to-r from-amber-900/40 to-orange-900/40 shadow-amber-500/20' 
                      : 'border-slate-600/40 bg-gradient-to-r from-slate-800/60 to-slate-700/60 hover:border-amber-500/50'
                  }`}
                  onClick={() => onOrderSelect(order)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getUrgencyColor(order.created_at)} border text-xs font-medium`}>
                        <Timer className="h-3 w-3 mr-1" />
                        {formatTimeAgo(order.created_at)}
                      </Badge>
                      <span className="text-white font-semibold text-sm">
                        #{order.id.slice(-6)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'preparing');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs h-7 px-3 shadow-lg border-0 group/btn"
                    >
                      <ChefHat className="h-3 w-3 mr-1 group-hover/btn:scale-110 transition-transform" />
                      Aceitar
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      <span className="font-bold text-amber-400 text-sm">R$ {order.total.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {order.restaurant_tables?.table_number 
                          ? `Mesa ${order.restaurant_tables.table_number}`
                          : 'Balcão'
                        }
                      </span>
                      <span className="mx-2">•</span>
                      <span>{order.order_items.length} {order.order_items.length === 1 ? 'item' : 'itens'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GradientCard>
      </div>

      {/* Pedidos em Preparo Premium */}
      <div className="flex-1">
        <GradientCard 
          title={`Em Preparo • ${preparingOrders.length}`}
          icon={<ChefHat className="h-5 w-5" />}
          className="h-full flex flex-col shadow-2xl border-slate-700/50"
        >
          {preparingOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-6 rounded-2xl mb-4 border border-slate-600/30">
                <ChefHat className="h-10 w-10 text-slate-500" />
              </div>
              <p className="font-medium mb-1">Nenhum pedido em preparo</p>
              <p className="text-sm text-slate-500">Aceite pedidos para começar</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3">
              {preparingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] shadow-lg backdrop-blur-sm ${
                    selectedOrderId === order.id 
                      ? 'border-amber-500 bg-gradient-to-r from-amber-900/40 to-orange-900/40 shadow-amber-500/20' 
                      : 'border-slate-600/40 bg-gradient-to-r from-slate-800/60 to-slate-700/60 hover:border-amber-500/50'
                  }`}
                  onClick={() => onOrderSelect(order)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 text-xs font-medium">
                        <ChefHat className="h-3 w-3 mr-1" />
                        {formatTimeAgo(order.created_at)}
                      </Badge>
                      <span className="text-white font-semibold text-sm">
                        #{order.id.slice(-6)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrderStatus(order.id, 'ready');
                      }}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs h-7 px-3 shadow-lg border-0 group/btn"
                    >
                      <CheckCircle className="h-3 w-3 mr-1 group-hover/btn:scale-110 transition-transform" />
                      Pronto
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      <span className="font-bold text-amber-400 text-sm">R$ {order.total.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {order.restaurant_tables?.table_number 
                          ? `Mesa ${order.restaurant_tables.table_number}`
                          : 'Balcão'
                        }
                      </span>
                      <span className="mx-2">•</span>
                      <span>{order.order_items.length} {order.order_items.length === 1 ? 'item' : 'itens'}</span>
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
