
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Building2, 
  Calendar,
  Settings,
  Zap,
  Phone,
  Mail,
  FileText,
  Filter,
  X,
  ArrowLeft,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImplementationTicketsViewProps {
  contextRestaurantId?: string;
}

const ImplementationTicketsView: React.FC<ImplementationTicketsViewProps> = ({ contextRestaurantId }) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Limpar filtros quando contexto mudar
  useEffect(() => {
    if (contextRestaurantId) {
      setSearchTerm('');
      setStatusFilter('all');
      setPriorityFilter('all');
    }
  }, [contextRestaurantId]);

  const { data: implementationTickets, isLoading } = useQuery({
    queryKey: ['implementation-tickets', statusFilter, contextRestaurantId],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          restaurant:restaurants(name, email, phone, plan_type, status, address),
          user:user_profiles!tickets_user_id_fkey(name)
        `)
        .eq('category', 'implementation')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (contextRestaurantId) {
        query = query.eq('restaurant_id', contextRestaurantId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar tickets de implementação:', error);
        throw error;
      }
      return data;
    }
  });

  // Buscar informações do restaurante específico se houver contexto
  const { data: contextRestaurant } = useQuery({
    queryKey: ['context-restaurant', contextRestaurantId],
    queryFn: async () => {
      if (!contextRestaurantId) return null;
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', contextRestaurantId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!contextRestaurantId
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string, status: string }) => {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString()
      };
      
      if (status === 'resolved') {
        updateData.resolved_by = userProfile?.id;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);
      
      if (error) {
        console.error('Erro ao atualizar ticket:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['master-stats'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro na mutação:', error);
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['master-stats'] });
      toast.success('Ticket removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover ticket: ' + error.message);
    }
  });

  const createImplementationTicketMutation = useMutation({
    mutationFn: async () => {
      if (!contextRestaurant) throw new Error('Restaurante não encontrado');

      const { error } = await supabase
        .from('tickets')
        .insert({
          restaurant_id: contextRestaurantId,
          user_id: userProfile?.id,
          title: `Implementação - ${contextRestaurant.name}`,
          description: `Ticket de implementação criado para o restaurante ${contextRestaurant.name}.\n\nPlano: ${contextRestaurant.plan_type}\nEmail: ${contextRestaurant.email}\nTelefone: ${contextRestaurant.phone}`,
          category: 'implementation',
          priority: 'high',
          status: 'open'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation-tickets'] });
      toast.success('Ticket de implementação criado!');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Novo';
      case 'in_progress': return 'Implementando';
      case 'resolved': return 'Implementado';
      case 'closed': return 'Finalizado';
      default: return status;
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const filteredTickets = implementationTickets?.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Context Alert */}
      {contextRestaurantId && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="text-blue-800 font-medium">
                    {contextRestaurant?.name || 'Restaurante específico'}
                  </span>
                  <p className="text-sm text-blue-700">
                    Visualizando implementação para este restaurante
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {filteredTickets?.length === 0 && (
                  <Button
                    size="sm"
                    onClick={() => createImplementationTicketMutation.mutate()}
                    disabled={createImplementationTicketMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Criar Ticket
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por restaurante ou ticket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="open">Novos</SelectItem>
                <SelectItem value="in_progress">Em implementação</SelectItem>
                <SelectItem value="resolved">Implementados</SelectItem>
                <SelectItem value="closed">Finalizados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
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
                <p className="text-sm text-gray-600">Novos</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredTickets?.filter(t => t.status === 'open').length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredTickets?.filter(t => t.status === 'in_progress').length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Implementados</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredTickets?.filter(t => t.status === 'resolved').length || 0}
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
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredTickets?.length || 0}
                </p>
              </div>
              <Settings className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tickets de Implementação ({filteredTickets?.length || 0})
            {contextRestaurantId && (
              <Badge className="bg-blue-100 text-blue-800">
                Restaurante Específico
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando tickets...</div>
          ) : (
            <div className="space-y-4">
              {filteredTickets?.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{ticket.title}</h3>
                        {getStatusIcon(ticket.status)}
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      
                      {/* Restaurant Info */}
                      {ticket.restaurant && !contextRestaurantId && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {ticket.restaurant.name}
                            <Badge variant="outline" className="ml-2">
                              {ticket.restaurant.plan_type}
                            </Badge>
                            <Badge variant="outline" className={
                              ticket.restaurant.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                              ticket.restaurant.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }>
                              {ticket.restaurant.status === 'active' ? 'Ativo' :
                               ticket.restaurant.status === 'pending' ? 'Pendente' : 'Inativo'}
                            </Badge>
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                            <span className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {ticket.restaurant.email}
                            </span>
                            <span className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {ticket.restaurant.phone}
                            </span>
                          </div>
                          {ticket.restaurant.address && (
                            <div className="mt-2 text-sm text-blue-700">
                              <span className="flex items-start gap-2">
                                <Building2 className="h-3 w-3 mt-0.5" />
                                {ticket.restaurant.address}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">{ticket.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.user?.name || 'Sistema'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                        {ticket.resolved_at && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Resolvido em {format(new Date(ticket.resolved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {ticket.status === 'open' && (
                        <Button
                          size="sm"
                          onClick={() => updateTicketMutation.mutate({
                            ticketId: ticket.id,
                            status: 'in_progress'
                          })}
                          disabled={updateTicketMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateTicketMutation.mutate({
                            ticketId: ticket.id,
                            status: 'resolved'
                          })}
                          disabled={updateTicketMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Finalizar
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
                          disabled={updateTicketMutation.isPending}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Arquivar
                        </Button>
                      )}
                      {userProfile?.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTicketMutation.mutate(ticket.id)}
                          disabled={deleteTicketMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!filteredTickets || filteredTickets.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>
                    {contextRestaurantId 
                      ? 'Nenhum ticket de implementação encontrado para este restaurante'
                      : 'Nenhum ticket de implementação encontrado'
                    }
                  </p>
                  {(searchTerm || priorityFilter !== 'all') && (
                    <p className="text-sm mt-2">Tente ajustar sua busca ou filtros</p>
                  )}
                  {contextRestaurantId && filteredTickets?.length === 0 && (
                    <Button
                      onClick={() => createImplementationTicketMutation.mutate()}
                      disabled={createImplementationTicketMutation.isPending}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Ticket
                    </Button>
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

export default ImplementationTicketsView;
