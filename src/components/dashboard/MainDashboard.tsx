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
  MessageSquare,
  QrCode,
  ChefHat,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
        {/* Header com links rápidos */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Controle do Restaurante
              </h1>
              <p className="text-gray-600">
                Painel de controle completo - {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            {/* Ações Rápidas */}
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/orders">
                  <Activity className="h-4 w-4 mr-2" />
                  Ver Pedidos
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/pos">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/whatsapp">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Link>
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
          {/* Pedidos Ativos - Atualizado */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Pedidos Recentes
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Últimos pedidos do sistema
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/orders">Ver Todos</Link>
                </Button>
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

          {/* Ações Rápidas - Novo */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Ações Rápidas
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild className="h-16 flex flex-col items-center justify-center">
                  <Link to="/pos">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span className="text-sm">Novo Pedido</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Link to="/kitchen">
                    <ChefHat className="h-6 w-6 mb-2" />
                    <span className="text-sm">Cozinha</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Link to="/whatsapp">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span className="text-sm">WhatsApp</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Link to="/management">
                    <Settings className="h-6 w-6 mb-2" />
                    <span className="text-sm">Gestão</span>
                  </Link>
                </Button>
              </div>

              {/* Link do Cardápio Digital */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Cardápio Digital</p>
                    <p className="text-xs text-blue-700">Compartilhe com seus clientes</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/menu/${userProfile?.restaurant_id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copiado!');
                    }}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
