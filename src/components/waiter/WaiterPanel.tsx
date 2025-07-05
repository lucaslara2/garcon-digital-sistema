
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  ClipboardList, 
  Ticket,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const WaiterPanel = () => {
  const { userProfile } = useAuth();
  
  const { data: tables, isLoading: loadingTables } = useQuery({
    queryKey: ['restaurant-tables', userProfile?.restaurant_id],
    queryFn: async () => {
      if (!userProfile?.restaurant_id) return [];
      
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select(`
          *,
          orders!orders_table_id_fkey(
            id,
            status,
            total,
            created_at
          )
        `)
        .eq('restaurant_id', userProfile.restaurant_id)
        .order('table_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const { data: myOrders } = useQuery({
    queryKey: ['waiter-orders', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            product:products(name, price)
          ),
          table:restaurant_tables(table_number)
        `)
        .eq('waiter_id', userProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.id
  });

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActiveOrdersForTable = (tableId: string) => {
    return tables?.find(t => t.id === tableId)?.orders?.filter(
      (order: any) => order.status !== 'delivered' && order.status !== 'cancelled'
    ) || [];
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel do Garçom</h1>
          <p className="text-slate-400">Gerencie mesas e pedidos</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Mesas Disponíveis
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {tables?.filter(t => t.status === 'available').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Mesas Ocupadas
              </CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {tables?.filter(t => t.status === 'occupied').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pedidos Ativos
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {myOrders?.filter(o => o.status !== 'delivered').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pedidos Hoje
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {myOrders?.filter(o => {
                  const today = new Date().toDateString();
                  return new Date(o.created_at).toDateString() === today;
                }).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tables" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="tables" className="text-slate-300">Mesas</TabsTrigger>
            <TabsTrigger value="orders" className="text-slate-300">Meus Pedidos</TabsTrigger>
            <TabsTrigger value="support" className="text-slate-300">Suporte</TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Controle de Mesas</CardTitle>
                <CardDescription className="text-slate-400">
                  Visualize e gerencie todas as mesas do restaurante
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTables ? (
                  <div className="text-slate-400">Carregando mesas...</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tables?.map((table) => {
                      const activeOrders = getActiveOrdersForTable(table.id);
                      return (
                        <Card key={table.id} className="bg-slate-700 border-slate-600 relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg text-white">
                                Mesa {table.table_number}
                              </CardTitle>
                              <Badge className={`${getTableStatusColor(table.status)} text-white text-xs`}>
                                {table.status}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">{table.seats} lugares</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {activeOrders.length > 0 && (
                              <div className="mb-3">
                                <p className="text-amber-500 text-sm">
                                  {activeOrders.length} comanda(s) ativa(s)
                                </p>
                                <p className="text-slate-400 text-xs">
                                  Total: R$ {activeOrders.reduce((sum: number, order: any) => sum + order.total, 0).toFixed(2)}
                                </p>
                              </div>
                            )}
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                className="w-full bg-amber-600 hover:bg-amber-700"
                                disabled={table.status === 'maintenance'}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Nova Comanda
                              </Button>
                              {activeOrders.length > 0 && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-slate-300 border-slate-600"
                                >
                                  Ver Comandas
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Meus Pedidos</CardTitle>
                <CardDescription className="text-slate-400">
                  Acompanhe todos os pedidos que você criou
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myOrders?.map((order) => (
                    <div key={order.id} className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-medium">
                            Mesa {order.table?.table_number} - Pedido #{order.id.slice(-8)}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {new Date(order.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getOrderStatusColor(order.status)} text-white`}>
                            {order.status}
                          </Badge>
                          <span className="text-white font-medium">
                            R$ {order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {order.order_items?.length} item(s)
                      </div>
                    </div>
                  ))}
                  {(!myOrders || myOrders.length === 0) && (
                    <div className="text-slate-400 text-center py-8">
                      Nenhum pedido encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Ticket className="mr-2 h-5 w-5" />
                  Suporte Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Sistema de suporte em desenvolvimento</p>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    Abrir Chamado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WaiterPanel;
