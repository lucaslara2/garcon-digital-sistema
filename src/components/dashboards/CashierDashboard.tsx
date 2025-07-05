
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  DollarSign, 
  ShoppingBag,
  LogOut,
  Clock,
  CheckCircle,
  Receipt,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

const CashierDashboard = () => {
  const { signOut, userProfile } = useAuth();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [todayPayments, setTodayPayments] = useState([]);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    cashPayments: 0,
    cardPayments: 0,
    pixPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
    fetchTodayPayments();
    fetchStats();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, price)
          ),
          restaurant_tables (table_number)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at');

      setPendingOrders(data || []);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('Erro ao carregar pedidos pendentes');
    }
  };

  const fetchTodayPayments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            *,
            restaurant_tables (table_number)
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      setTodayPayments(data || []);
    } catch (error) {
      console.error('Error fetching today payments:', error);
      toast.error('Erro ao carregar pagamentos de hoje');
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Today's orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .gte('created_at', today);

      // Today's payments by method
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('status', 'completed')
        .gte('created_at', today);

      // Pending orders
      const { data: pendingData } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .in('status', ['pending', 'preparing', 'ready']);

      const todayRevenue = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const cashPayments = paymentsData?.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + p.amount, 0) || 0;
      const cardPayments = paymentsData?.filter(p => ['credit_card', 'debit_card'].includes(p.payment_method)).reduce((sum, p) => sum + p.amount, 0) || 0;
      const pixPayments = paymentsData?.filter(p => p.payment_method === 'pix').reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        todayRevenue,
        todayOrders: ordersData?.length || 0,
        pendingOrders: pendingData?.length || 0,
        cashPayments,
        cardPayments,
        pixPayments
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      case 'split': return 'Dividido';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">PDV - Caixa</h1>
                <p className="text-slate-300">Bem-vindo, {userProfile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Calculator className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="border-slate-600 text-slate-300">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Receita Hoje
              </CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {stats.todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-slate-400">
                Faturamento do dia
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Pedidos Hoje
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.todayOrders}</div>
              <p className="text-xs text-slate-400">
                Pedidos processados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pendingOrders}</div>
              <p className="text-xs text-slate-400">
                Aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Dinheiro
              </CardTitle>
              <Receipt className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {stats.cashPayments.toFixed(2)}</div>
              <p className="text-xs text-slate-400">
                Pagamentos em dinheiro
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-600">Pedidos Pendentes</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-amber-600">Pagamentos Hoje</TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-amber-600">Resumo do Dia</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pedidos Aguardando Pagamento</CardTitle>
                <CardDescription className="text-slate-400">
                  Finalize os pedidos processando o pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    Nenhum pedido pendente no momento
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map((order: any) => (
                      <div key={order.id} className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {order.restaurant_tables && (
                              <span className="text-white font-medium">
                                Mesa {order.restaurant_tables.table_number}
                              </span>
                            )}
                            <Badge 
                              className={`${getOrderStatusColor(order.status)} text-white text-xs`}
                            >
                              {getOrderStatusText(order.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-bold text-lg">
                              R$ {order.total?.toFixed(2)}
                            </span>
                            {order.status === 'ready' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Finalizar
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-slate-400">
                          {order.order_items?.length || 0} itens • {' '}
                          Pedido às {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {order.order_items && order.order_items.length > 0 && (
                          <div className="mt-2 text-sm text-slate-300">
                            {order.order_items.slice(0, 3).map((item: any, index: number) => (
                              <span key={index}>
                                {item.quantity}x {item.products?.name}
                                {index < Math.min(order.order_items.length, 3) - 1 ? ', ' : ''}
                              </span>
                            ))}
                            {order.order_items.length > 3 && (
                              <span className="text-slate-400"> e mais {order.order_items.length - 3} itens</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pagamentos de Hoje</CardTitle>
                <CardDescription className="text-slate-400">
                  Histórico de pagamentos processados hoje
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                  </div>
                ) : todayPayments.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    Nenhum pagamento processado hoje
                  </p>
                ) : (
                  <div className="space-y-4">
                    {todayPayments.map((payment: any) => (
                      <div key={payment.id} className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {payment.orders?.restaurant_tables && (
                              <span className="text-white font-medium">
                                Mesa {payment.orders.restaurant_tables.table_number}
                              </span>
                            )}
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {getPaymentMethodText(payment.payment_method)}
                            </Badge>
                          </div>
                          <span className="text-white font-bold">
                            R$ {payment.amount?.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">
                          {new Date(payment.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {payment.transaction_id && (
                            <span> • ID: {payment.transaction_id.substring(0, 8)}...</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-center">Dinheiro</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    R$ {stats.cashPayments.toFixed(2)}
                  </div>
                  <p className="text-slate-400 text-sm">Pagamentos em espécie</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-center">Cartões</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    R$ {stats.cardPayments.toFixed(2)}
                  </div>
                  <p className="text-slate-400 text-sm">Crédito e débito</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-center">PIX</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    R$ {stats.pixPayments.toFixed(2)}
                  </div>
                  <p className="text-slate-400 text-sm">Pagamentos instantâneos</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CashierDashboard;
