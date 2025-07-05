
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
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function MainDashboard() {
  const { userProfile } = useAuth();

  // Dados simulados - em produção viriam da API
  const stats = [
    {
      title: 'Vendas Hoje',
      value: 'R$ 2.450,00',
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pedidos Hoje',
      value: '34',
      change: '+8 novos',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Tempo Médio',
      value: '15 min',
      change: '-3 min',
      trend: 'up',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Clientes Ativos',
      value: '12',
      change: 'Mesa ocupadas',
      trend: 'neutral',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const activeOrders = [
    { id: '#001', table: 'Mesa 3', items: 4, time: '8 min', status: 'preparing' },
    { id: '#002', table: 'Mesa 7', items: 2, time: '12 min', status: 'ready' },
    { id: '#003', table: 'Delivery', items: 6, time: '5 min', status: 'preparing' },
    { id: '#004', table: 'Mesa 1', items: 3, time: '15 min', status: 'waiting' }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Controle do Restaurante
          </h1>
          <p className="text-gray-600">
            Painel de controle completo - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'} mt-1`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pedidos Ativos */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Pedidos Ativos
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Acompanhe os pedidos em andamento
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {activeOrders.length} ativos
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">
                        {order.id}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.table}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {order.items} itens
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{order.time}</span>
                      <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Dia */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Resumo do Dia
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Performance de hoje vs. ontem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Pedidos Finalizados</div>
                      <div className="text-xs text-gray-600">Hoje: 28 pedidos</div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    +12%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Faturamento</div>
                      <div className="text-xs text-gray-600">Meta: R$ 3.000</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    82%
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Produtos em Falta</div>
                      <div className="text-xs text-gray-600">Verificar estoque</div>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    3 itens
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
