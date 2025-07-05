
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin,
  CreditCard,
  Settings,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  FileText,
  Star,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RestaurantDetailsViewProps {
  restaurantId: string;
  onBack: () => void;
  onNavigateToTab: (tabId: string, restaurantId?: string) => void;
}

const RestaurantDetailsView: React.FC<RestaurantDetailsViewProps> = ({ 
  restaurantId, 
  onBack, 
  onNavigateToTab 
}) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Buscar dados do restaurante
  const { data: restaurant, isLoading } = useQuery({
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

  // Buscar estatísticas do restaurante
  const { data: stats } = useQuery({
    queryKey: ['restaurant-stats', restaurantId],
    queryFn: async () => {
      const [ordersResult, paymentsResult, clientsResult, productsResult] = await Promise.all([
        supabase.from('orders').select('id, total, status, created_at').eq('restaurant_id', restaurantId),
        supabase.from('payments').select('id, amount, status').eq('restaurant_id', restaurantId),
        supabase.from('clients').select('id, created_at').eq('restaurant_id', restaurantId),
        supabase.from('products').select('id').eq('restaurant_id', restaurantId)
      ]);

      const orders = ordersResult.data || [];
      const payments = paymentsResult.data || [];
      const clients = clientsResult.data || [];
      const products = productsResult.data || [];

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const completedOrders = orders.filter(o => o.status === 'delivered').length;
      const averageTicket = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      return {
        totalOrders: orders.length,
        completedOrders,
        totalRevenue,
        averageTicket,
        activeClients: clients.length,
        totalProducts: products.length
      };
    }
  });

  // Buscar tickets de implementação
  const { data: implementationTickets } = useQuery({
    queryKey: ['restaurant-implementation-tickets', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('category', 'implementation')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar pedidos recentes
  const { data: recentOrders } = useQuery({
    queryKey: ['restaurant-recent-orders', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          client:clients(name, phone)
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const createImplementationTicketMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('tickets')
        .insert({
          restaurant_id: restaurantId,
          user_id: userProfile?.id,
          title: `Implementação - ${restaurant?.name}`,
          description: `Ticket de implementação criado para o restaurante ${restaurant?.name}.\n\nPlano: ${restaurant?.plan_type}\nEmail: ${restaurant?.email}\nTelefone: ${restaurant?.phone}`,
          category: 'implementation',
          priority: 'high',
          status: 'open'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-implementation-tickets'] });
      toast.success('Ticket de implementação criado!');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'expired': return 'bg-red-50 text-red-700 border-red-200';
      case 'blocked': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'blocked': return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'preparing': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do restaurante...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-gray-600">Restaurante não encontrado</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const hasImplementation = implementationTickets && implementationTickets.length > 0;
  const hasOpenImplementation = implementationTickets?.some(t => t.status === 'open');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600">Detalhes completos do restaurante</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusIcon(restaurant.status)}
          <Badge className={getStatusColor(restaurant.status)}>
            {restaurant.status === 'active' ? 'Ativo' :
             restaurant.status === 'pending' ? 'Pendente' :
             restaurant.status === 'expired' ? 'Expirado' : 'Bloqueado'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">R$ {(stats?.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-bold">{stats?.activeClients || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {(stats?.averageTicket || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="implementation">Implementação</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{restaurant.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{restaurant.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">CNPJ</label>
                    <div className="flex items-center gap-2 mt-1">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{restaurant.cnpj}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Plano</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span className="text-sm capitalize">{restaurant.plan_type}</span>
                    </div>
                  </div>
                </div>
                {restaurant.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Endereço</label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-sm">{restaurant.address}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Expira em</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {format(new Date(restaurant.plan_expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status de Implementação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Status de Implementação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasImplementation ? (
                  <div className="space-y-3">
                    {implementationTickets?.map((ticket) => (
                      <div key={ticket.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{ticket.title}</span>
                          <Badge className={
                            ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {ticket.status === 'open' ? 'Pendente' :
                             ticket.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="text-xs text-gray-500">
                          Criado em {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => onNavigateToTab('implementation', restaurantId)}
                      className="w-full"
                      variant="outline"
                    >
                      Ver Todos os Tickets
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Nenhuma implementação registrada</p>
                    <Button
                      onClick={() => createImplementationTicketMutation.mutate()}
                      disabled={createImplementationTicketMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Ticket de Implementação
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          Pedido #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {order.client?.name || order.customer_name || 'Cliente não identificado'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">R$ {order.total.toFixed(2)}</div>
                        <div className={`text-sm ${getOrderStatusColor(order.status)}`}>
                          {order.status === 'delivered' ? 'Entregue' :
                           order.status === 'preparing' ? 'Preparando' :
                           order.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum pedido encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Implementação
                {!hasImplementation && (
                  <Button
                    onClick={() => createImplementationTicketMutation.mutate()}
                    disabled={createImplementationTicketMutation.isPending}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Ticket
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasImplementation ? (
                <div className="space-y-4">
                  {implementationTickets?.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{ticket.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Prioridade: {ticket.priority}</span>
                            <span>Criado: {format(new Date(ticket.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                        </div>
                        <Badge className={
                          ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                          ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {ticket.status === 'open' ? 'Pendente' :
                           ticket.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => onNavigateToTab('implementation', restaurantId)}
                    className="w-full"
                    variant="outline"
                  >
                    Gerenciar Implementação
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">
                    Nenhum processo de implementação iniciado para este restaurante
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Inicie um processo de implementação para acompanhar o progresso de configuração do restaurante
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => onNavigateToTab('implementation', restaurantId)}
                  variant="outline"
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Implementação</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Gerenciar processo de implementação
                    </p>
                  </div>
                </Button>

                <Button
                  onClick={() => onNavigateToTab('tickets')}
                  variant="outline"
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Tickets</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Ver todos os tickets
                    </p>
                  </div>
                </Button>

                {!hasImplementation && (
                  <Button
                    onClick={() => createImplementationTicketMutation.mutate()}
                    disabled={createImplementationTicketMutation.isPending}
                    className="justify-start h-auto p-4"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Nova Implementação</span>
                      </div>
                      <p className="text-xs opacity-90">
                        Iniciar processo de implementação
                      </p>
                    </div>
                  </Button>
                )}

                <Button
                  onClick={onBack}
                  variant="outline"
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="font-medium">Voltar</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Retornar à lista de restaurantes
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantDetailsView;
