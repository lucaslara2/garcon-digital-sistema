
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { 
  Building2, 
  Users, 
  Ticket, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Shield,
  BarChart3,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Zap,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import StaffManagement from './StaffManagement';

type RestaurantStatus = Database['public']['Enums']['restaurant_status'];
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

const EnhancedMasterDashboard = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [ticketFilter, setTicketFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');

  // Buscar dados dos restaurantes com mais informações
  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['enhanced-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          user_profiles(count),
          orders(count),
          payments(sum:amount)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: userProfile?.role === 'admin' || userProfile?.role === 'staff'
  });

  // Buscar dados dos tickets com informações avançadas
  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['enhanced-tickets', ticketFilter, timeRange],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          restaurant:restaurants(name, status, plan_type),
          user:user_profiles!tickets_user_id_fkey(name, role),
          resolved_user:user_profiles!tickets_resolved_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (ticketFilter !== 'all') {
        query = query.eq('status', ticketFilter);
      }

      // Filtro por período
      if (timeRange !== 'all') {
        const days = parseInt(timeRange.replace('d', ''));
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        query = query.gte('created_at', dateLimit.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: userProfile?.role === 'admin' || userProfile?.role === 'staff'
  });

  // Estatísticas avançadas
  const enhancedStats = useMemo(() => {
    if (!tickets || !restaurants) return null;

    const ticketStats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      avgResolutionTime: 0, // Calcular baseado em resolved_at - created_at
    };

    const restaurantStats = {
      total: restaurants.length,
      active: restaurants.filter(r => r.status === 'active').length,
      expired: restaurants.filter(r => r.status === 'expired').length,
      blocked: restaurants.filter(r => r.status === 'blocked').length,
      pending: restaurants.filter(r => r.status === 'pending').length,
      basic: restaurants.filter(r => r.plan_type === 'basic').length,
      premium: restaurants.filter(r => r.plan_type === 'premium').length,
      enterprise: restaurants.filter(r => r.plan_type === 'enterprise').length,
    };

    return { ticketStats, restaurantStats };
  }, [tickets, restaurants]);

  // Atualizar status do ticket
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status, resolvedBy }: { ticketId: string, status: string, resolvedBy?: string }) => {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = resolvedBy || userProfile?.id;
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-tickets'] });
      toast.success('Ticket atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar ticket: ' + error.message);
    }
  });

  // Atualizar status do restaurante
  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ restaurantId, status }: { restaurantId: string, status: RestaurantStatus }) => {
      const { error } = await supabase
        .from('restaurants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', restaurantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-restaurants'] });
      toast.success('Status do restaurante atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar restaurante: ' + error.message);
    }
  });

  const getStatusIcon = (status: string, type: 'ticket' | 'restaurant') => {
    if (type === 'ticket') {
      switch (status) {
        case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
        case 'in_progress': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'resolved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
        default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
      }
    } else {
      switch (status) {
        case 'active': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'expired': return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'blocked': return <XCircle className="h-4 w-4 text-gray-500" />;
        default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
      }
    }
  };

  const getStatusColor = (status: string, type: 'ticket' | 'restaurant') => {
    if (type === 'ticket') {
      switch (status) {
        case 'open': return 'bg-red-100 text-red-800 border-red-200';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
        case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'expired': return 'bg-red-100 text-red-800 border-red-200';
        case 'blocked': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRestaurant = selectedRestaurant === 'all' || 
      ticket.restaurant_id === selectedRestaurant;

    return matchesSearch && matchesRestaurant;
  });

  if (userProfile?.role !== 'admin' && userProfile?.role !== 'staff') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-slate-300">Você não tem permissão para acessar o painel master.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header aprimorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-500" />
                Painel Master
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {userProfile?.role === 'admin' ? 'Administrador' : 'Staff de Suporte'}
                </Badge>
              </h1>
              <p className="text-slate-400">Controle avançado do sistema SaaS • Última atualização: agora</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="1d">Hoje</SelectItem>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                <Activity className="h-4 w-4 mr-2" />
                Tempo Real
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas Avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Restaurantes Ativos
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {enhancedStats?.restaurantStats.active || 0}
              </div>
              <p className="text-xs text-blue-200">
                {enhancedStats?.restaurantStats.total || 0} total registrados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">
                Tickets Urgentes
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {enhancedStats?.ticketStats.urgent || 0}
              </div>
              <p className="text-xs text-red-200">
                {enhancedStats?.ticketStats.open || 0} tickets em aberto
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Taxa de Resolução
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {enhancedStats?.ticketStats.total > 0 ? 
                  Math.round(((enhancedStats.ticketStats.resolved + enhancedStats.ticketStats.closed) / enhancedStats.ticketStats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-green-200">
                {(enhancedStats?.ticketStats.resolved || 0) + (enhancedStats?.ticketStats.closed || 0)} resolvidos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Receita Mensal
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ 0</div>
              <p className="text-xs text-purple-200">
                Integração pendente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" />
                Distribuição por Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Básico</span>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {enhancedStats?.restaurantStats.basic || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Premium</span>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {enhancedStats?.restaurantStats.premium || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Enterprise</span>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {enhancedStats?.restaurantStats.enterprise || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Status dos Restaurantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Ativos
                  </span>
                  <span className="text-green-400 font-bold">
                    {enhancedStats?.restaurantStats.active || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Expirados
                  </span>
                  <span className="text-red-400 font-bold">
                    {enhancedStats?.restaurantStats.expired || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    Pendentes
                  </span>
                  <span className="text-yellow-400 font-bold">
                    {enhancedStats?.restaurantStats.pending || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full justify-start" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todos os Logs
                </Button>
                <Button size="sm" className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Relatório Financeiro
                </Button>
                <Button size="sm" className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Criar Staff
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="tickets" className="text-slate-300">
              <Ticket className="h-4 w-4 mr-2" />
              Tickets Avançados
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="text-slate-300">
              <Building2 className="h-4 w-4 mr-2" />
              Restaurantes
            </TabsTrigger>
            <TabsTrigger value="staff" className="text-slate-300">
              <Shield className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            {/* Filtros Avançados */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar tickets por título ou restaurante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filtrar por restaurante" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos os restaurantes</SelectItem>
                  {restaurants?.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                  <Button
                    key={status}
                    variant={ticketFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTicketFilter(status)}
                    className="border-slate-600"
                  >
                    {status === 'all' ? 'Todos' : 
                     status === 'open' ? 'Abertos' :
                     status === 'in_progress' ? 'Em Andamento' :
                     status === 'resolved' ? 'Resolvidos' : 'Fechados'}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Tickets de Suporte Avançados
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {filteredTickets?.length || 0} tickets encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="text-slate-400 text-center py-8">Carregando tickets...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets?.map((ticket) => (
                      <div key={ticket.id} className="p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-medium">{ticket.title}</h3>
                              {getStatusIcon(ticket.status, 'ticket')}
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status, 'ticket')}>
                                {ticket.status === 'open' ? 'Aberto' :
                                 ticket.status === 'in_progress' ? 'Em Andamento' :
                                 ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                            <div className="flex items-center gap-6 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {ticket.restaurant?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {ticket.user?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </span>
                              {ticket.resolved_user && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Resolvido por: {ticket.resolved_user.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end ml-4">
                            <div className="flex gap-2">
                              {ticket.status === 'open' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTicketMutation.mutate({
                                    ticketId: ticket.id,
                                    status: 'in_progress'
                                  })}
                                  className="border-slate-600 text-slate-300 hover:bg-yellow-600 hover:text-white"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Assumir
                                </Button>
                              )}
                              {ticket.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTicketMutation.mutate({
                                    ticketId: ticket.id,
                                    status: 'resolved'
                                  })}
                                  className="border-slate-600 text-slate-300 hover:bg-green-600 hover:text-white"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolver
                                </Button>
                              )}
                              {ticket.status === 'resolved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTicketMutation.mutate({
                                    ticketId: ticket.id,
                                    status: 'closed'
                                  })}
                                  className="border-slate-600 text-slate-300 hover:bg-gray-600 hover:text-white"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Finalizar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!filteredTickets || filteredTickets.length === 0) && (
                      <div className="text-center py-8 text-slate-400">
                        <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum ticket encontrado</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restaurants" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Gerenciamento Avançado de Restaurantes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Controle completo de {restaurants?.length || 0} restaurantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRestaurants ? (
                  <div className="text-slate-400 text-center py-8">Carregando restaurantes...</div>
                ) : (
                  <div className="space-y-4">
                    {restaurants?.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-medium">{restaurant.name}</h3>
                            {getStatusIcon(restaurant.status, 'restaurant')}
                            <Badge className={getStatusColor(restaurant.status, 'restaurant')}>
                              {restaurant.status === 'active' ? 'Ativo' :
                               restaurant.status === 'pending' ? 'Pendente' :
                               restaurant.status === 'expired' ? 'Expirado' : 'Bloqueado'}
                            </Badge>
                            <Badge variant="outline" className="text-slate-300 border-slate-600">
                              {restaurant.plan_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {restaurant.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {restaurant.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expira: {new Date(restaurant.plan_expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {userProfile?.role === 'admin' && (
                            <div className="flex gap-2">
                              {restaurant.status !== 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRestaurantMutation.mutate({
                                    restaurantId: restaurant.id,
                                    status: 'active' as RestaurantStatus
                                  })}
                                  className="border-slate-600 text-slate-300 hover:bg-green-600 hover:text-white"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Ativar
                                </Button>
                              )}
                              {restaurant.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRestaurantMutation.mutate({
                                    restaurantId: restaurant.id,
                                    status: 'blocked' as RestaurantStatus
                                  })}
                                  className="border-slate-600 text-slate-300 hover:bg-red-600 hover:text-white"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Bloquear
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-white"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Métricas de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxa de Resolução:</span>
                      <span className="text-white font-medium">
                        {enhancedStats?.ticketStats.total > 0 ? 
                          Math.round(((enhancedStats.ticketStats.resolved + enhancedStats.ticketStats.closed) / enhancedStats.ticketStats.total) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tickets Atendidos:</span>
                      <span className="text-white font-medium">
                        {(enhancedStats?.ticketStats.resolved || 0) + (enhancedStats?.ticketStats.closed || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tickets Pendentes:</span>
                      <span className="text-white font-medium">
                        {(enhancedStats?.ticketStats.open || 0) + (enhancedStats?.ticketStats.inProgress || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tempo Médio de Resposta:</span>
                      <span className="text-white font-medium">2.4h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Crescimento do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Restaurantes Ativos:</span>
                      <span className="text-green-400 font-medium">
                        +{enhancedStats?.restaurantStats.active || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Novos Tickets (7d):</span>
                      <span className="text-blue-400 font-medium">
                        +{enhancedStats?.ticketStats.total || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxa de Crescimento:</span>
                      <span className="text-green-400 font-medium">+12.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Satisfação do Cliente:</span>
                      <span className="text-green-400 font-medium">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedMasterDashboard;
