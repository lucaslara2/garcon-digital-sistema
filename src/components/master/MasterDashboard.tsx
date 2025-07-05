
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const MasterDashboard = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [ticketFilter, setTicketFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar dados dos restaurantes
  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['master-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          user_profiles(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: userProfile?.role === 'admin' || userProfile?.role === 'staff'
  });

  // Buscar dados dos tickets
  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['master-tickets', ticketFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          restaurant:restaurants(name, status),
          user:user_profiles!tickets_user_id_fkey(name),
          resolved_user:user_profiles!tickets_resolved_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (ticketFilter !== 'all') {
        query = query.eq('status', ticketFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: userProfile?.role === 'admin' || userProfile?.role === 'staff'
  });

  // Estatísticas de tickets
  const ticketStats = React.useMemo(() => {
    if (!tickets) return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
    
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
  }, [tickets]);

  // Estatísticas de restaurantes
  const restaurantStats = React.useMemo(() => {
    if (!restaurants) return { total: 0, active: 0, expired: 0, blocked: 0, pending: 0 };
    
    return {
      total: restaurants.length,
      active: restaurants.filter(r => r.status === 'active').length,
      expired: restaurants.filter(r => r.status === 'expired').length,
      blocked: restaurants.filter(r => r.status === 'blocked').length,
      pending: restaurants.filter(r => r.status === 'pending').length
    };
  }, [restaurants]);

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
      queryClient.invalidateQueries({ queryKey: ['master-tickets'] });
      toast.success('Ticket atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar ticket: ' + error.message);
    }
  });

  // Atualizar status do restaurante
  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ restaurantId, status }: { restaurantId: string, status: string }) => {
      const { error } = await supabase
        .from('restaurants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', restaurantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-restaurants'] });
      toast.success('Status do restaurante atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar restaurante: ' + error.message);
    }
  });

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

  const filteredTickets = tickets?.filter(ticket => 
    searchTerm === '' || 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Painel Master - {userProfile?.role === 'admin' ? 'Administrador' : 'Staff de Suporte'}
          </h1>
          <p className="text-slate-400">Gerenciamento completo do sistema SaaS</p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Restaurantes
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{restaurantStats.total}</div>
              <p className="text-xs text-slate-400">
                {restaurantStats.active} ativos, {restaurantStats.expired} expirados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Tickets Abertos
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{ticketStats.open}</div>
              <p className="text-xs text-slate-400">
                {ticketStats.inProgress} em andamento
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Tickets Resolvidos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{ticketStats.resolved}</div>
              <p className="text-xs text-slate-400">
                {ticketStats.closed} finalizados
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Performance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {ticketStats.total > 0 ? Math.round((ticketStats.resolved + ticketStats.closed) / ticketStats.total * 100) : 0}%
              </div>
              <p className="text-xs text-slate-400">
                Taxa de resolução
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="tickets" className="text-slate-300">
              Tickets de Suporte
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="text-slate-300">
              Restaurantes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300">
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
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
                  Gerenciamento de Tickets
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {filteredTickets?.length || 0} tickets encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTickets ? (
                  <div className="text-slate-400">Carregando...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets?.map((ticket) => (
                      <div key={ticket.id} className="p-4 border border-slate-700 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{ticket.title}</h3>
                            <p className="text-slate-400 text-sm mb-2">{ticket.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>Restaurante: {ticket.restaurant?.name}</span>
                              <span>Por: {ticket.user?.name}</span>
                              <span>Criado: {new Date(ticket.created_at).toLocaleDateString()}</span>
                              {ticket.resolved_user && (
                                <span>Resolvido por: {ticket.resolved_user.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status, 'ticket')}>
                                {ticket.status === 'open' ? 'Aberto' :
                                 ticket.status === 'in_progress' ? 'Em Andamento' :
                                 ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {ticket.status === 'open' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateTicketMutation.mutate({
                                    ticketId: ticket.id,
                                    status: 'in_progress'
                                  })}
                                  className="border-slate-600 text-slate-300"
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
                                  className="border-slate-600 text-slate-300"
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
                                  className="border-slate-600 text-slate-300"
                                >
                                  Finalizar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  Gerenciamento de Restaurantes
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Supervisão completa de todos os restaurantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRestaurants ? (
                  <div className="text-slate-400">Carregando...</div>
                ) : (
                  <div className="space-y-4">
                    {restaurants?.map((restaurant) => (
                      <div key={restaurant.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{restaurant.name}</h3>
                          <p className="text-slate-400 text-sm">{restaurant.email}</p>
                          <p className="text-slate-400 text-sm">
                            Plano: {restaurant.plan_type} | 
                            Expira: {new Date(restaurant.plan_expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(restaurant.status, 'restaurant')}>
                            {restaurant.status === 'active' ? 'Ativo' :
                             restaurant.status === 'pending' ? 'Pendente' :
                             restaurant.status === 'expired' ? 'Expirado' : 'Bloqueado'}
                          </Badge>
                          {userProfile?.role === 'admin' && (
                            <div className="flex gap-2">
                              {restaurant.status !== 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRestaurantMutation.mutate({
                                    restaurantId: restaurant.id,
                                    status: 'active'
                                  })}
                                  className="border-slate-600 text-slate-300"
                                >
                                  Ativar
                                </Button>
                              )}
                              {restaurant.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateRestaurantMutation.mutate({
                                    restaurantId: restaurant.id,
                                    status: 'blocked'
                                  })}
                                  className="border-slate-600 text-slate-300"
                                >
                                  Bloquear
                                </Button>
                              )}
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

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Métricas de Suporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxa de Resolução:</span>
                      <span className="text-white font-medium">
                        {ticketStats.total > 0 ? Math.round((ticketStats.resolved + ticketStats.closed) / ticketStats.total * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tickets Atendidos:</span>
                      <span className="text-white font-medium">{ticketStats.resolved + ticketStats.closed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tickets Pendentes:</span>
                      <span className="text-white font-medium">{ticketStats.open + ticketStats.inProgress}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Status dos Restaurantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Restaurantes Ativos:</span>
                      <span className="text-green-400 font-medium">{restaurantStats.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Restaurantes Expirados:</span>
                      <span className="text-red-400 font-medium">{restaurantStats.expired}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Restaurantes Pendentes:</span>
                      <span className="text-yellow-400 font-medium">{restaurantStats.pending}</span>
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

export default MasterDashboard;
