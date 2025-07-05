
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
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

const ImplementationTicketsView = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: implementationTickets, isLoading } = useQuery({
    queryKey: ['implementation-tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          restaurant:restaurants(name, email, phone, plan_type, status),
          user:user_profiles!tickets_user_id_fkey(name)
        `)
        .eq('category', 'implementation')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string, status: string }) => {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status, 
          updated_at: new Date().toISOString(),
          ...(status === 'resolved' && { resolved_by: userProfile?.id, resolved_at: new Date().toISOString() })
        })
        .eq('id', ticketId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['implementation-tickets'] });
      toast.success('Status atualizado com sucesso!');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredTickets = implementationTickets?.filter(ticket =>
    searchTerm === '' || 
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
                          {ticket.status === 'open' ? 'Novo' :
                           ticket.status === 'in_progress' ? 'Implementando' :
                           ticket.status === 'resolved' ? 'Implementado' : 'Finalizado'}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      {/* Restaurant Info */}
                      {ticket.restaurant && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {ticket.restaurant.name}
                            <Badge variant="outline" className="ml-2">
                              {ticket.restaurant.plan_type}
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
                        </div>
                      )}
                      
                      <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">{ticket.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.user?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
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
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!filteredTickets || filteredTickets.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum ticket de implementação encontrado</p>
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
