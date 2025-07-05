
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { 
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Calendar,
  Star,
  Package,
  ChefHat,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Eye,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function MainDashboard() {
  const { userProfile } = useAuth();

  // Dados simulados mais completos - em produção viriam da API
  const stats = [
    {
      title: 'Faturamento Hoje',
      value: 'R$ 2.450,00',
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      target: 'Meta: R$ 3.000',
      percentage: 82
    },
    {
      title: 'Pedidos Hoje',
      value: '34',
      change: '+8 novos',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      target: 'Meta: 45 pedidos',
      percentage: 76
    },
    {
      title: 'Tempo Médio',
      value: '15 min',
      change: '-3 min',
      trend: 'up',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      target: 'Meta: ≤20 min',
      percentage: 75
    },
    {
      title: 'Satisfação',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      target: '23 avaliações',
      percentage: 96
    }
  ];

  const quickActions = [
    {
      title: 'Novo Pedido',
      description: 'Criar pedido no PDV',
      icon: ShoppingCart,
      color: 'bg-blue-600 hover:bg-blue-700',
      href: '/pos'
    },
    {
      title: 'Cozinha',
      description: 'Gerenciar preparo',
      icon: ChefHat,
      color: 'bg-orange-600 hover:bg-orange-700',
      href: '/kitchen'
    },
    {
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: TrendingUp,
      color: 'bg-green-600 hover:bg-green-700',
      href: '/reports'
    },
    {
      title: 'Configurações',
      description: 'Menu e mesas',
      icon: Package,
      color: 'bg-purple-600 hover:bg-purple-700',
      href: '/restaurant-management'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'order',
      title: 'Novo pedido #035',
      description: 'Mesa 5 - R$ 85,50',
      time: '2 min atrás',
      status: 'new',
      icon: ShoppingCart
    },
    {
      id: 2,
      type: 'payment',
      title: 'Pagamento recebido',
      description: 'Pedido #032 - PIX R$ 45,00',
      time: '5 min atrás',
      status: 'completed',
      icon: CreditCard
    },
    {
      id: 3,
      type: 'alert',
      title: 'Estoque baixo',
      description: 'Coca-Cola 2L (3 unidades)',
      time: '12 min atrás',
      status: 'warning',
      icon: AlertTriangle
    },
    {
      id: 4,
      type: 'review',
      title: 'Nova avaliação',
      description: '5 estrelas - "Excelente!"',
      time: '20 min atrás',
      status: 'positive',
      icon: Star
    }
  ];

  const topProducts = [
    { name: 'Hambúrguer Clássico', sales: 12, revenue: 'R$ 180,00' },
    { name: 'Pizza Margherita', sales: 8, revenue: 'R$ 240,00' },
    { name: 'Refrigerante', sales: 15, revenue: 'R$ 75,00' },
    { name: 'Batata Frita', sales: 10, revenue: 'R$ 100,00' }
  ];

  const activeOrders = [
    { id: '#035', table: 'Mesa 5', items: 3, time: '12 min', status: 'preparing', priority: 'normal' },
    { id: '#036', table: 'Delivery', items: 2, time: '8 min', status: 'ready', priority: 'urgent' },
    { id: '#037', table: 'Mesa 2', items: 5, time: '15 min', status: 'waiting', priority: 'normal' },
    { id: '#038', table: 'Mesa 8', items: 4, time: '5 min', status: 'preparing', priority: 'normal' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'waiting': return 'Aguardando';
      default: return 'Pendente';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'positive': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Painel de Controle
              </h1>
              <p className="text-gray-600">
                Visão completa do seu restaurante - {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Relatório do Dia
              </Button>
              <Button size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar Métricas
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">{stat.target}</p>
                      <p className="text-xs font-medium text-gray-700">{stat.percentage}%</p>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  className={`${action.color} text-white h-auto p-6 flex-col space-y-2 hover:scale-105 transition-transform`}
                  onClick={() => window.location.href = action.href}
                >
                  <Icon className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Orders */}
          <Card className="lg:col-span-1 bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Pedidos Ativos
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {activeOrders.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {activeOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">
                      {order.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.table}
                    </div>
                    {order.priority === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{order.time}</span>
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="lg:col-span-1 bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Produtos em Destaque
              </CardTitle>
              <CardDescription className="text-gray-600">
                Mais vendidos hoje
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {product.sales}x
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-green-600 mt-1">
                      {product.revenue}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-1 bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-purple-600" />
                  Atividade Recente
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Visão Geral da Performance
            </CardTitle>
            <CardDescription className="text-gray-600">
              Resumo das métricas principais do negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-green-800">Faturamento Mensal</h4>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">R$ 47.500</div>
                <div className="text-sm text-green-700">+18% vs mês passado</div>
                <Progress value={75} className="mt-2 h-2" />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-800">Média de Atendimento</h4>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">14 min</div>
                <div className="text-sm text-blue-700">-2 min vs semana passada</div>
                <Progress value={85} className="mt-2 h-2" />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-purple-800">Taxa de Ocupação</h4>
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">68%</div>
                <div className="text-sm text-purple-700">+5% vs ontem</div>
                <Progress value={68} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
