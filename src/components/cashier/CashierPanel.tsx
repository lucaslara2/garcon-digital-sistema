
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Ticket,
  Clock,
  CheckCircle,
  Plus,
  Printer
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CashierPanel = () => {
  const { userProfile } = useAuth();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [orderType, setOrderType] = useState<string>('dine_in');
  
  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['cashier-orders', userProfile?.restaurant_id],
    queryFn: async () => {
      if (!userProfile?.restaurant_id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            quantity,
            unit_price,
            total_price,
            product:products(name)
          ),
          table:restaurant_tables(table_number),
          client:clients(name, phone)
        `)
        .eq('restaurant_id', userProfile.restaurant_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const { data: tables } = useQuery({
    queryKey: ['cashier-tables', userProfile?.restaurant_id],
    queryFn: async () => {
      if (!userProfile?.restaurant_id) return [];
      
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)
        .order('table_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const { data: products } = useQuery({
    queryKey: ['cashier-products', userProfile?.restaurant_id],
    queryFn: async () => {
      if (!userProfile?.restaurant_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name)
        `)
        .eq('restaurant_id', userProfile.restaurant_id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
  const readyOrders = orders?.filter(o => o.status === 'ready') || [];
  const todayOrders = orders?.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.created_at).toDateString() === today;
  }) || [];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel do Caixa / PDV</h1>
          <p className="text-slate-400">Sistema de ponto de venda e controle de pedidos</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pedidos Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {pendingOrders.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pedidos Prontos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {readyOrders.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Vendas Hoje
              </CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                R$ {todayOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Pedidos Hoje
              </CardTitle>
              <Receipt className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {todayOrders.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="orders" className="text-slate-300">Pedidos</TabsTrigger>
            <TabsTrigger value="new-order" className="text-slate-300">Novo Pedido</TabsTrigger>
            <TabsTrigger value="payments" className="text-slate-300">Pagamentos</TabsTrigger>
            <TabsTrigger value="support" className="text-slate-300">Suporte</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                    Pedidos Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-medium">
                              #{order.id.slice(-8)} - {order.order_type === 'dine_in' ? `Mesa ${order.table?.table_number}` : order.order_type}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                          <span className="text-white font-medium">
                            R$ {order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Aceitar
                          </Button>
                          <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingOrders.length === 0 && (
                      <div className="text-slate-400 text-center py-4">
                        Nenhum pedido pendente
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                    Pedidos Prontos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {readyOrders.map((order) => (
                      <div key={order.id} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-medium">
                              #{order.id.slice(-8)} - {order.order_type === 'dine_in' ? `Mesa ${order.table?.table_number}` : order.order_type}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              Pronto há {Math.floor((Date.now() - new Date(order.updated_at).getTime()) / 60000)} min
                            </p>
                          </div>
                          <span className="text-white font-medium">
                            R$ {order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Entregar
                          </Button>
                          <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {readyOrders.length === 0 && (
                      <div className="text-slate-400 text-center py-4">
                        Nenhum pedido pronto
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="new-order" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="order-type" className="text-slate-300">Tipo do Pedido</Label>
                    <Select value={orderType} onValueChange={setOrderType}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dine_in">Mesa</SelectItem>
                        <SelectItem value="takeout">Balcão</SelectItem>
                        <SelectItem value="delivery">Entrega</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {orderType === 'dine_in' && (
                    <div>
                      <Label htmlFor="table-select" className="text-slate-300">Mesa</Label>
                      <Select value={selectedTable} onValueChange={setSelectedTable}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Selecione uma mesa" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables?.map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                              Mesa {table.table_number} ({table.seats} lugares)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="customer-name" className="text-slate-300">Nome do Cliente</Label>
                    <Input
                      id="customer-name"
                      placeholder="Nome (opcional)"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Produtos</h3>
                  <div className="text-slate-400 text-center py-8">
                    <Plus className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                    <p>Interface de seleção de produtos em desenvolvimento</p>
                    <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                      Adicionar Produto
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Controle de Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Sistema de pagamentos em desenvolvimento</p>
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

export default CashierPanel;
