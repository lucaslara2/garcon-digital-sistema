
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChefHat,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const KitchenDisplay = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch orders for kitchen
  const { data: orders } = useQuery({
    queryKey: ['kitchen-orders', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            notes,
            product:products(name)
          ),
          table:restaurant_tables(table_number)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .in('status', ['pending', 'preparing'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id,
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Update order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Status do pedido atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pedido: ' + error.message);
    }
  });

  const getOrderAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  const getOrderPriority = (age: number) => {
    if (age > 30) return 'high';
    if (age > 15) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <ChefHat className="mr-3 h-8 w-8" />
            Sistema da Cozinha
          </h1>
          <p className="text-slate-400">Gerenciamento de pedidos em tempo real</p>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders?.map((order) => {
            const age = getOrderAge(order.created_at);
            const priority = getOrderPriority(age);

            return (
              <Card key={order.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg">
                        #{order.id.slice(-6)}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {order.table ? `Mesa ${order.table.table_number}` : order.order_type}
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={`${getPriorityColor(priority)} text-white text-xs`}>
                        {age} min
                      </Badge>
                      <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                        {order.status === 'pending' ? 'Pendente' : 'Preparando'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="bg-slate-700 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {item.quantity}x {item.product?.name}
                            </p>
                            {item.notes && (
                              <p className="text-slate-400 text-sm mt-1">
                                Obs: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Info */}
                  <div className="text-slate-400 text-sm space-y-1">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {order.table ? `Mesa ${order.table.table_number}` : 'Balcão'}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                    </div>
                    {order.customer_name && (
                      <div className="flex items-center">
                        <span className="ml-6">{order.customer_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {order.status === 'pending' && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => updateOrderStatusMutation.mutate({
                          orderId: order.id,
                          status: 'preparing'
                        })}
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Iniciar Preparo
                      </Button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => updateOrderStatusMutation.mutate({
                          orderId: order.id,
                          status: 'ready'
                        })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como Pronto
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(!orders || orders.length === 0) && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <ChefHat className="h-12 w-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhum pedido na fila
              </h3>
              <p className="text-slate-400">
                Quando novos pedidos chegarem, eles aparecerão aqui
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
