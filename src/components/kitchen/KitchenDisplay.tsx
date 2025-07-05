
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChefHat,
  MapPin,
  Timer,
  Flame
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

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
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
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
      case 'high': return 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25';
      case 'medium': return 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25';
      case 'low': return 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/25';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 shadow-slate-500/25';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg';
      case 'preparing': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg';
      case 'ready': return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Flame className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Timer className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4 flex items-center justify-center">
              <ChefHat className="mr-4 h-10 w-10 text-amber-500" />
              Sistema da Cozinha
            </h1>
            <p className="text-slate-400 text-lg">Gerenciamento de pedidos em tempo real</p>
            <div className="mt-4 flex justify-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{orders?.filter(o => o.status === 'pending').length || 0}</div>
                <div className="text-sm text-slate-400">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{orders?.filter(o => o.status === 'preparing').length || 0}</div>
                <div className="text-sm text-slate-400">Preparando</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders?.map((order) => {
            const age = getOrderAge(order.created_at);
            const priority = getOrderPriority(age);

            return (
              <Card key={order.id} className="bg-slate-800/70 backdrop-blur-sm border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:scale-[1.02] animate-fade-in">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl font-bold">
                        #{order.id.slice(-6)}
                      </CardTitle>
                      <CardDescription className="text-slate-400 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {order.table ? `Mesa ${order.table.table_number}` : order.order_type}
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={`${getPriorityColor(priority)} text-white text-xs shadow-lg flex items-center gap-1`}>
                        {getPriorityIcon(priority)}
                        {age} min
                      </Badge>
                      <Badge className={`${getStatusColor(order.status)} text-xs`}>
                        {order.status === 'pending' ? 'Pendente' : 'Preparando'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Enhanced Order Items */}
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full">
                                {item.quantity}x
                              </span>
                              <p className="text-white font-semibold">
                                {item.product?.name}
                              </p>
                            </div>
                            {item.notes && (
                              <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg mt-2">
                                <p className="text-blue-400 text-sm">
                                  💬 {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Order Info */}
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-600/30">
                    <div className="text-slate-300 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-amber-500" />
                          <span>{new Date(order.created_at).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        {order.customer_name && (
                          <span className="text-amber-400 font-medium">{order.customer_name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-2">
                    {order.status === 'pending' && (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        onClick={() => updateOrderStatusMutation.mutate({
                          orderId: order.id,
                          status: 'preparing' as OrderStatus
                        })}
                      >
                        <ChefHat className="h-4 w-4 mr-2" />
                        Iniciar Preparo
                      </Button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <Button
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        onClick={() => updateOrderStatusMutation.mutate({
                          orderId: order.id,
                          status: 'ready' as OrderStatus
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

        {/* Enhanced Empty State */}
        {(!orders || orders.length === 0) && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 max-w-md w-full">
              <CardContent className="p-12 text-center">
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChefHat className="h-12 w-12 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Nenhum pedido na fila
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Quando novos pedidos chegarem, eles aparecerão aqui automaticamente
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
