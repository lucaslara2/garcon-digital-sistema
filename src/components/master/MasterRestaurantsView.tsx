
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Settings,
  Eye,
  Ticket,
  CreditCard,
  MapPin,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type RestaurantStatus = Database['public']['Enums']['restaurant_status'];

interface MasterRestaurantsViewProps {
  onNavigateToTab?: (tabId: string, restaurantId?: string) => void;
}

const MasterRestaurantsView: React.FC<MasterRestaurantsViewProps> = ({ onNavigateToTab }) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['master-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar tickets de implementação por restaurante
  const { data: implementationTickets } = useQuery({
    queryKey: ['implementation-tickets-by-restaurant'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('restaurant_id, status')
        .eq('category', 'implementation');
      
      if (error) throw error;
      
      const ticketsByRestaurant = new Map();
      data.forEach(ticket => {
        if (!ticketsByRestaurant.has(ticket.restaurant_id)) {
          ticketsByRestaurant.set(ticket.restaurant_id, []);
        }
        ticketsByRestaurant.get(ticket.restaurant_id).push(ticket);
      });
      
      return ticketsByRestaurant;
    }
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ restaurantId, status }: { restaurantId: string, status: RestaurantStatus }) => {
      const { error } = await supabase
        .from('restaurants')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', restaurantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['master-stats'] });
      toast.success('Status do restaurante atualizado!');
    }
  });

  const createImplementationTicketMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      const restaurant = restaurants?.find(r => r.id === restaurantId);
      if (!restaurant) throw new Error('Restaurante não encontrado');

      const { error } = await supabase
        .from('tickets')
        .insert({
          restaurant_id: restaurantId,
          user_id: userProfile?.id,
          title: `Implementação - ${restaurant.name}`,
          description: `Ticket de implementação criado para o restaurante ${restaurant.name}.\n\nPlano: ${restaurant.plan_type}\nEmail: ${restaurant.email}\nTelefone: ${restaurant.phone}`,
          category: 'implementation',
          priority: 'high',
          status: 'open'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation-tickets-by-restaurant'] });
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
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'blocked': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'basic': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImplementationStatus = (restaurantId: string) => {
    const tickets = implementationTickets?.get(restaurantId) || [];
    if (tickets.length === 0) return null;
    
    const hasOpen = tickets.some(t => t.status === 'open');
    const hasInProgress = tickets.some(t => t.status === 'in_progress');
    const hasResolved = tickets.some(t => t.status === 'resolved');
    
    if (hasInProgress) return { status: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' };
    if (hasOpen) return { status: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' };
    if (hasResolved) return { status: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800' };
    
    return null;
  };

  const handleNavigateToImplementation = (restaurantId: string) => {
    if (onNavigateToTab) {
      onNavigateToTab('implementation', restaurantId);
    }
  };

  const filteredRestaurants = restaurants?.filter(restaurant => {
    const matchesSearch = searchTerm === '' || 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cnpj.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    const matchesPlan = planFilter === 'all' || restaurant.plan_type === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="blocked">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredRestaurants?.filter(r => r.status === 'active').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredRestaurants?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredRestaurants?.filter(r => r.status === 'expired').length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredRestaurants?.length || 0}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Restaurantes ({filteredRestaurants?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando restaurantes...</div>
          ) : (
            <div className="space-y-4">
              {filteredRestaurants?.map((restaurant) => {
                const implementationStatus = getImplementationStatus(restaurant.id);
                const isExpiringSoon = new Date(restaurant.plan_expires_at) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <div key={restaurant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-medium text-gray-900 text-lg">{restaurant.name}</h3>
                          {getStatusIcon(restaurant.status)}
                          <Badge className={getStatusColor(restaurant.status)}>
                            {restaurant.status === 'active' ? 'Ativo' :
                             restaurant.status === 'pending' ? 'Pendente' :
                             restaurant.status === 'expired' ? 'Expirado' : 'Bloqueado'}
                          </Badge>
                          <Badge className={getPlanColor(restaurant.plan_type)}>
                            {restaurant.plan_type.charAt(0).toUpperCase() + restaurant.plan_type.slice(1)}
                          </Badge>
                          {implementationStatus && (
                            <Badge className={implementationStatus.color}>
                              <Settings className="h-3 w-3 mr-1" />
                              {implementationStatus.label}
                            </Badge>
                          )}
                          {isExpiringSoon && restaurant.status === 'active' && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Expira em breve
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {restaurant.email}
                          </span>
                          <span className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {restaurant.phone}
                          </span>
                          <span className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            CNPJ: {restaurant.cnpj}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Expira: {new Date(restaurant.plan_expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        {restaurant.address && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {restaurant.address}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {/* Ações para Staff/Admin */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNavigateToImplementation(restaurant.id)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Detalhes
                          </Button>
                          
                          {!implementationStatus && (
                            <Button
                              size="sm"
                              onClick={() => createImplementationTicketMutation.mutate(restaurant.id)}
                              disabled={createImplementationTicketMutation.isPending}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Marcar Implementação
                            </Button>
                          )}
                          
                          {implementationStatus && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNavigateToImplementation(restaurant.id)}
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                              <Ticket className="h-3 w-3 mr-1" />
                              Ver Implementação
                            </Button>
                          )}
                        </div>
                        
                        {/* Ações de Admin */}
                        {userProfile?.role === 'admin' && (
                          <div className="flex gap-2">
                            {restaurant.status !== 'active' && (
                              <Button
                                size="sm"
                                onClick={() => updateRestaurantMutation.mutate({
                                  restaurantId: restaurant.id,
                                  status: 'active' as RestaurantStatus
                                })}
                                disabled={updateRestaurantMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
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
                                disabled={updateRestaurantMutation.isPending}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Bloquear
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!filteredRestaurants || filteredRestaurants.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum restaurante encontrado</p>
                  {(searchTerm || statusFilter !== 'all' || planFilter !== 'all') && (
                    <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterRestaurantsView;
