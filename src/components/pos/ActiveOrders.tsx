import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, CheckCircle, Timer, MapPin, AlertCircle, FileText } from 'lucide-react';
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
  filterStatus?: 'pending' | 'preparing' | 'ready';
}

export function ActiveOrders({ onOrderSelect, selectedOrderId, filterStatus }: ActiveOrdersProps) {
  const { userProfile } = useAuth();

  const getStatusFilter = (): OrderStatus[] => {
    if (filterStatus === 'pending') return ['pending'];
    if (filterStatus === 'preparing') return ['preparing'];
    if (filterStatus === 'ready') return ['ready'];
    return ['pending', 'preparing'];
  };

  const { data: activeOrders, refetch } = useQuery({
    queryKey: ['active-orders', userProfile?.restaurant_id, filterStatus],
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
        .in('status', getStatusFilter())
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

  const getTitle = () => {
    if (filterStatus === 'pending') return 'Pedidos Pendentes';
    if (filterStatus === 'preparing') return 'Pedidos em Preparo';
    if (filterStatus === 'ready') return 'Pedidos Prontos';
    return 'Pedidos Ativos';
  };

  const getIcon = () => {
    if (filterStatus === 'pending') return <Clock className="h-4 w-4 mr-2 text-yellow-600" />;
    if (filterStatus === 'preparing') return <ChefHat className="h-4 w-4 mr-2 text-blue-600" />;
    if (filterStatus === 'ready') return <CheckCircle className="h-4 w-4 mr-2 text-green-600" />;
    return <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          {getIcon()}
          {getTitle()}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeOrders?.map((order) => (
          <div
            key={order.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedOrderId === order.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
            }`}
            onClick={() => onOrderSelect(order)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    order.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : order.status === 'preparing'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                  }`}
                >
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTimeAgo(order.created_at)}
                </Badge>
                <span className="text-gray-900 font-medium text-sm">#{order.id.slice(-6)}</span>
              </div>
              
              {order.status === 'pending' && (
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
              )}
              
              {order.status === 'preparing' && (
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
              )}

              {order.status === 'ready' && (
                <Badge className="bg-green-600 text-white text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Pronto
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{order.customer_name}</span>
                <span className="font-bold text-green-600">R$ {order.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center text-gray-500 text-sm">
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
              
              {/* Preview dos itens */}
              <div className="text-xs text-gray-400">
                {order.order_items.slice(0, 2).map((item, index) => (
                  <span key={item.id}>
                    {item.quantity}x {item.products.name}
                    {index < Math.min(order.order_items.length, 2) - 1 ? ', ' : ''}
                  </span>
                ))}
                {order.order_items.length > 2 && <span> +{order.order_items.length - 2} mais</span>}
              </div>
            </div>
          </div>
        ))}

        {activeOrders?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            {filterStatus === 'ready' ? (
              <FileText className="h-12 w-12 mb-4 text-gray-300" />
            ) : (
              <Clock className="h-12 w-12 mb-4 text-gray-300" />
            )}
            <p className="text-lg font-medium mb-2 text-gray-600">
              {filterStatus === 'pending' && 'Nenhum pedido pendente'}
              {filterStatus === 'preparing' && 'Nenhum pedido em preparo'}
              {filterStatus === 'ready' && 'Nenhum pedido pronto'}
              {!filterStatus && 'Nenhum pedido ativo'}
            </p>
            <p className="text-sm text-gray-400">
              {filterStatus === 'ready' 
                ? 'Pedidos prontos aparecerão aqui'
                : 'Novos pedidos aparecerão aqui'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
