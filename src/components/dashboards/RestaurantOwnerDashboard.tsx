
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Users, 
  DollarSign, 
  ShoppingBag,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  Gift,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const RestaurantOwnerDashboard = () => {
  const { signOut, userProfile } = useAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeProducts: 0,
    staffMembers: 0
  });
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
    fetchStats();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', userProfile?.restaurant_id)
        .single();

      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Erro ao carregar dados do restaurante');
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

      // Active products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('is_active', true);

      // Staff members
      const { data: staffData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id);

      const todayRevenue = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      setStats({
        todayOrders: ordersData?.length || 0,
        todayRevenue,
        activeProducts: productsData?.length || 0,
        staffMembers: staffData?.length || 0
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Painel do Restaurante</h1>
                <p className="text-slate-300">{restaurant?.name || 'Carregando...'}</p>
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
                Pedidos Hoje
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.todayOrders}</div>
              <p className="text-xs text-slate-400">
                Pedidos do dia atual
              </p>
            </CardContent>
          </Card>

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
                Produtos Ativos
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeProducts}</div>
              <p className="text-xs text-slate-400">
                No cardápio
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Funcionários
              </CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.staffMembers}</div>
              <p className="text-xs text-slate-400">
                Usuários ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-600">Visão Geral</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-amber-600">Cardápio</TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-amber-600">Funcionários</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-amber-600">Relatórios</TabsTrigger>
            <TabsTrigger value="marketing" className="data-[state=active]:bg-amber-600">Marketing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Pedidos Recentes</CardTitle>
                  <CardDescription className="text-slate-400">
                    Últimos pedidos do seu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-center py-4">
                    Nenhum pedido recente encontrado
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Produtos em Destaque</CardTitle>
                  <CardDescription className="text-slate-400">
                    Seus produtos mais vendidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-center py-4">
                    Configure seu cardápio para ver os destaques
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Gerenciar Cardápio</CardTitle>
                    <CardDescription className="text-slate-400">
                      Adicione e gerencie seus produtos
                    </CardDescription>
                  </div>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-center py-8">
                  Comece adicionando produtos ao seu cardápio
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Funcionários</CardTitle>
                    <CardDescription className="text-slate-400">
                      Gerencie garçons, caixas e outros funcionários
                    </CardDescription>
                  </div>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Funcionário
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-center py-8">
                  Adicione funcionários para começar a usar o sistema
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-amber-500" />
                  Relatórios de Vendas
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Acompanhe o desempenho do seu restaurante
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-center py-8">
                  Relatórios serão gerados após os primeiros pedidos
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-amber-500" />
                    Promoções
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Crie cupons e ofertas especiais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Promoção
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="h-5 w-5 mr-2 text-amber-500" />
                    Programa de Fidelidade
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure pontos e recompensas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Pontos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantOwnerDashboard;
