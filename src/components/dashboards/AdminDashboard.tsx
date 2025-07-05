
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp,
  Settings,
  LogOut,
  Crown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { signOut, userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalUsers: 0,
    monthlyRevenue: 0
  });
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRestaurants();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*');

      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*');

      setStats({
        totalRestaurants: restaurantsData?.length || 0,
        activeRestaurants: restaurantsData?.filter(r => r.status === 'active').length || 0,
        totalUsers: usersData?.length || 0,
        monthlyRevenue: 0 // This would be calculated from subscription payments
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Erro ao carregar estatísticas');
    }
  };

  const fetchRestaurants = async () => {
    try {
      const { data } = await supabase
        .from('restaurants_with_status')
        .select('*')
        .order('created_at', { ascending: false });

      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Erro ao carregar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'expired': return 'Expirado';
      case 'pending': return 'Pendente';
      case 'blocked': return 'Bloqueado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Painel Master</h1>
                <p className="text-slate-300">Bem-vindo, {userProfile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
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
                Total de Restaurantes
              </CardTitle>
              <Building className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalRestaurants}</div>
              <p className="text-xs text-slate-400">
                {stats.activeRestaurants} ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Usuários Totais
              </CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-slate-400">
                Todos os perfis
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-400">
                Planos ativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Taxa de Crescimento
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+12%</div>
              <p className="text-xs text-slate-400">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Restaurantes Cadastrados</CardTitle>
            <CardDescription className="text-slate-400">
              Gerencie todos os restaurantes da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurants.map((restaurant: any) => (
                  <div key={restaurant.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(restaurant.status)}`}></div>
                      <div>
                        <h3 className="font-medium text-white">{restaurant.name}</h3>
                        <p className="text-sm text-slate-400">{restaurant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {getStatusText(restaurant.status)}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {restaurant.plan_type}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-slate-300">
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
