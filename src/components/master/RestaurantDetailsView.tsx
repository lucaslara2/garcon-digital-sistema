import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock,
  Users,
  CreditCard,
  Ticket,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Package,
  ShoppingCart,
  ArrowLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RestaurantLoginManager from './RestaurantLoginManager';

interface RestaurantDetailsViewProps {
  restaurantId: string;
  onBack?: () => void;
  onNavigateToTab?: (tabId: string, restaurantId?: string) => void;
}

const RestaurantDetailsView: React.FC<RestaurantDetailsViewProps> = ({ 
  restaurantId, 
  onBack,
  onNavigateToTab 
}) => {
  const { data: restaurant, isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurant-details', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['restaurant-stats', restaurantId],
    queryFn: async () => {
      const [ordersResult, usersResult, ticketsResult, productsResult] = await Promise.all([
        supabase.from('orders').select('id, total, status, created_at').eq('restaurant_id', restaurantId),
        supabase.from('user_profiles').select('id, role, created_at').eq('restaurant_id', restaurantId),
        supabase.from('tickets').select('id, status, category, created_at').eq('restaurant_id', restaurantId),
        supabase.from('products').select('id, is_active').eq('restaurant_id', restaurantId)
      ]);

      const orders = ordersResult.data || [];
      const users = usersResult.data || [];
      const tickets = ticketsResult.data || [];
      const products = productsResult.data || [];

      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + Number(order.total), 0);

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentOrders = orders.filter(o => new Date(o.created_at) >= last30Days);
      const openTickets = tickets.filter(t => t.status === 'open');
      const implementationTickets = tickets.filter(t => t.category === 'implementation');

      return {
        totalOrders: orders.length,
        totalRevenue,
        recentOrders: recentOrders.length,
        totalUsers: users.length,
        staffCount: users.filter(u => ['waiter', 'cashier', 'kitchen'].includes(u.role)).length,
        openTickets: openTickets.length,
        implementationTickets: implementationTickets.length,
        activeProducts: products.filter(p => p.is_active).length,
        totalProducts: products.length
      };
    }
  });

  if (loadingRestaurant) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Restaurante não encontrado</h3>
        <p className="text-gray-600">O restaurante solicitado não foi encontrado.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'enterprise': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      )}

      {/* Header do Restaurante */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className={`${getStatusColor(restaurant.status)} text-white`}>
                  {restaurant.status}
                </Badge>
                <Badge className={`${getPlanColor(restaurant.plan_type)} text-white`}>
                  {restaurant.plan_type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{restaurant.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{restaurant.phone}</span>
            </div>
            {restaurant.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.address}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Criado em {format(new Date(restaurant.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Plano expira em {format(new Date(restaurant.plan_expires_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Pedidos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.recentOrders || 0} nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Total
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Pedidos entregues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Equipe
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.staffCount || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.totalUsers || 0} usuários total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tickets Abertos
            </CardTitle>
            <Ticket className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openTickets || 0}</div>
            <p className="text-xs text-gray-600 mt-1">
              {stats?.implementationTickets || 0} implementação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Componente de Gerenciamento de Login */}
      <RestaurantLoginManager restaurant={restaurant} />

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Produtos Ativos:</span>
                <span className="font-semibold">{stats?.activeProducts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Produtos:</span>
                <span className="font-semibold">{stats?.totalProducts || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informações do Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Plano Atual:</span>
                <Badge className={`${getPlanColor(restaurant.plan_type)} text-white`}>
                  {restaurant.plan_type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className={`${getStatusColor(restaurant.status)} text-white`}>
                  {restaurant.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Expira em:</span>
                <span className="text-sm">
                  {format(new Date(restaurant.plan_expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDetailsView;
