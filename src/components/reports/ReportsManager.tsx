
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ReportsManager = () => {
  const { userProfile } = useAuth();
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('sales');

  const getDateRange = (range: string) => {
    const today = new Date();
    switch (range) {
      case 'today':
        return {
          start: startOfDay(today),
          end: endOfDay(today)
        };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return {
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        };
      case 'week':
        return {
          start: startOfDay(subDays(today, 7)),
          end: endOfDay(today)
        };
      case 'month':
        return {
          start: startOfDay(subDays(today, 30)),
          end: endOfDay(today)
        };
      default:
        return {
          start: startOfDay(today),
          end: endOfDay(today)
        };
    }
  };

  const { start: startDate, end: endDate } = getDateRange(dateRange);

  // Relatório de Vendas
  const { data: salesData } = useQuery({
    queryKey: ['sales-report', userProfile?.restaurant_id, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(quantity, total_price),
          payments(amount, payment_method, status)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('status', 'delivered')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Relatório de Produtos
  const { data: productsData } = useQuery({
    queryKey: ['products-report', userProfile?.restaurant_id, dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name, price, cost_price),
          orders!inner(created_at, status, restaurant_id)
        `)
        .eq('orders.restaurant_id', userProfile?.restaurant_id)
        .eq('orders.status', 'delivered')
        .gte('orders.created_at', startDate.toISOString())
        .lte('orders.created_at', endDate.toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Calcular estatísticas de vendas
  const salesStats = React.useMemo(() => {
    if (!salesData) return null;

    const totalOrders = salesData.length;
    const totalRevenue = salesData.reduce((sum, order) => sum + order.total, 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const paymentMethods = salesData.reduce((acc, order) => {
      order.payments?.forEach((payment: any) => {
        if (payment.status === 'completed') {
          acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.amount;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    const orderTypes = salesData.reduce((acc, order) => {
      acc[order.order_type] = (acc[order.order_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue,
      averageTicket,
      paymentMethods,
      orderTypes
    };
  }, [salesData]);

  // Calcular estatísticas de produtos
  const productsStats = React.useMemo(() => {
    if (!productsData) return null;

    const productSales = productsData.reduce((acc, item) => {
      const productName = item.products?.name || 'Produto desconhecido';
      if (!acc[productName]) {
        acc[productName] = {
          name: productName,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        };
      }
      
      acc[productName].quantity += item.quantity;
      acc[productName].revenue += item.total_price;
      acc[productName].cost += (item.products?.cost_price || 0) * item.quantity;
      acc[productName].profit = acc[productName].revenue - acc[productName].cost;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(productSales).sort((a: any, b: any) => b.quantity - a.quantity);
  }, [productsData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPeriod = (range: string) => {
    switch (range) {
      case 'today': return 'Hoje';
      case 'yesterday': return 'Ontem';
      case 'week': return 'Últimos 7 dias';
      case 'month': return 'Últimos 30 dias';
      default: return 'Período selecionado';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada do seu negócio</p>
        </div>
        
        <div className="flex space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Vendas</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Clientes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Faturamento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(salesStats?.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 p-3 rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pedidos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {salesStats?.totalOrders || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-600 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ticket Médio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(salesStats?.averageTicket || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-600 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Período</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPeriod(dateRange)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(salesStats?.paymentMethods || {}).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="capitalize text-gray-600">
                        {method === 'cash' ? 'Dinheiro' : 
                         method === 'credit_card' ? 'Cartão de Crédito' :
                         method === 'debit_card' ? 'Cartão de Débito' :
                         method === 'pix' ? 'PIX' : method}
                      </span>
                      <span className="font-bold">{formatCurrency(amount as number)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle>Tipos de Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(salesStats?.orderTypes || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize text-gray-600">
                        {type === 'dine_in' ? 'Balcão' : 
                         type === 'delivery' ? 'Delivery' :
                         type === 'takeout' ? 'Retirada' : type}
                      </span>
                      <span className="font-bold">{count as number} pedidos</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Ranking de produtos por quantidade vendida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(productsStats as any[])?.slice(0, 10).map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.quantity} unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-green-600">
                        Lucro: {formatCurrency(product.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Relatório de Vendas Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Gráficos detalhados de vendas em desenvolvimento...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Relatório de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>Análise de clientes em desenvolvimento...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManager;
