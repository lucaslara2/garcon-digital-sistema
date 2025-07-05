
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  ShoppingBag,
  LogOut,
  Plus,
  Table,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const WaiterDashboard = () => {
  const { signOut, userProfile } = useAuth();
  const [tables, setTables] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [stats, setStats] = useState({
    activeTables: 0,
    todayOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
    fetchMyOrders();
    fetchStats();
  }, []);

  const fetchTables = async () => {
    try {
      const { data } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('table_number');

      setTables(data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Erro ao carregar mesas');
    }
  };

  const fetchMyOrders = async () => {
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
        .eq('waiter_id', userProfile?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setMyOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar pedidos');
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Active tables (occupied)
      const { data: activeTables } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('status', 'occupied');

      // Today's orders by this waiter
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('waiter_id', userProfile?.id)
        .gte('created_at', today);

      // Pending orders by this waiter
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('waiter_id', userProfile?.id)
        .in('status', ['pending', 'preparing']);

      setStats({
        activeTables: activeTables?.length || 0,
        todayOrders: todayOrders?.length || 0,
        pendingOrders: pendingOrders?.length || 0
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

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'maintenance': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTableStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Livre';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'maintenance': return 'Manutenção';
      default: return 'Desconhecido';
    }
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Painel do Garçom</h1>
                <p className="text-slate-300">Bem-vindo, {userProfile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Mesas Ativas
              </CardTitle>
              <Table className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeTables}</div>
              <p className="text-xs text-slate-400">
                Mesas ocupadas
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
                Pedidos do dia
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
                Aguardando
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tables Grid */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Mesas do Restaurante</CardTitle>
              <CardDescription className="text-slate-400">
                Status atual das mesas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {tables.map((table: any) => (
                    <div
                      key={table.id}
                      className="relative p-4 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">Mesa {table.table_number}</span>
                        <div className={`w-3 h-3 rounded-full ${getTableStatusColor(table.status)}`}></div>
                      </div>
                      <div className="text-xs text-slate-400 mb-2">{table.seats} lugares</div>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-slate-600 text-slate-300"
                      >
                        {getTableStatusText(table.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Meus Pedidos Recentes</CardTitle>
              <CardDescription className="text-slate-400">
                Últimos pedidos que você atendeu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : myOrders.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  Nenhum pedido encontrado
                </p>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order: any) => (
                    <div key={order.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
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
                        <span className="text-slate-300 text-sm">
                          R$ {order.total?.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {order.order_items?.length || 0} itens • {' '}
                        {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;
