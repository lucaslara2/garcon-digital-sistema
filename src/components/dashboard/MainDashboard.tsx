
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { 
  Users, 
  ChefHat, 
  CreditCard, 
  BarChart3, 
  Settings,
  Bell,
  TrendingUp,
  Clock
} from 'lucide-react';
import { GradientCard } from '@/components/ui/gradient-card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export function MainDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Sistema da Cozinha',
      description: 'Visualizar pedidos em preparo',
      icon: <ChefHat className="h-6 w-6" />,
      onClick: () => navigate('/kitchen'),
      gradient: 'warning' as const
    },
    {
      title: 'PDV / Caixa',
      description: 'Processar vendas e pagamentos',
      icon: <CreditCard className="h-6 w-6" />,
      onClick: () => navigate('/pos'),
      gradient: 'success' as const
    },
    {
      title: 'Relatórios',
      description: 'Análise de vendas e performance',
      icon: <BarChart3 className="h-6 w-6" />,
      onClick: () => navigate('/reports'),
      gradient: 'default' as const
    },
    {
      title: 'Configurações',
      description: 'Gerenciar restaurante',
      icon: <Settings className="h-6 w-6" />,
      onClick: () => navigate('/restaurant-management'),
      gradient: 'default' as const
    }
  ];

  const stats = [
    { label: 'Pedidos Hoje', value: '24', change: '+12%', trend: 'up' },
    { label: 'Vendas Hoje', value: 'R$ 1.250', change: '+8%', trend: 'up' },
    { label: 'Mesas Ocupadas', value: '8/12', change: '67%', trend: 'neutral' },
    { label: 'Tempo Médio', value: '18min', change: '-2min', trend: 'up' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={`Bem-vindo, ${userProfile?.full_name || 'Usuário'}!`}
          description="Painel de controle do seu restaurante"
          icon={<ChefHat className="h-10 w-10" />}
        >
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Sistema Online
            </Badge>
            <div className="flex items-center text-slate-400">
              <Clock className="h-4 w-4 mr-2" />
              <span>{new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
        </PageHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <GradientCard
              key={index}
              title={stat.value}
              description={stat.label}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className={`text-sm ${
                  stat.trend === 'up' ? 'text-emerald-400' : 
                  stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {stat.change}
                </span>
                {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
              </div>
            </GradientCard>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Users className="h-6 w-6 text-amber-500 mr-3" />
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <GradientCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                gradient={action.gradient}
                className="cursor-pointer"
              >
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 transition-all duration-300"
                  onClick={action.onClick}
                >
                  Acessar
                </Button>
              </GradientCard>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <GradientCard
          title="Atividade Recente"
          description="Últimas ações no sistema"
          icon={<Bell className="h-6 w-6" />}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-white">Pedido #1234 finalizado</span>
              </div>
              <span className="text-slate-400 text-sm">5 min atrás</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-white">Novo pedido #1235 recebido</span>
              </div>
              <span className="text-slate-400 text-sm">8 min atrás</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-white">Mesa 5 liberada</span>
              </div>
              <span className="text-slate-400 text-sm">12 min atrás</span>
            </div>
          </div>
        </GradientCard>
      </div>
    </div>
  );
}
