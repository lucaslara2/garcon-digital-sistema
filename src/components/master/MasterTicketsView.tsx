
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Search, Clock, CheckCircle, AlertCircle, User, Building2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const MasterTicketsView = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['master-tickets', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          restaurant:restaurants(name),
          user:user_profiles!tickets_user_id_fkey(name)
        `)
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
      queryClient.invalidateQueries({ queryKey: ['master-tickets'] });
      toast.success('Ticket atualizado com sucesso!');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-200';
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredTickets = tickets?.filter(ticket =>
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
                placeholder="Buscar tickets..."
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
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">
            Tickets de Suporte ({filteredTickets?.length || 0})
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
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status === 'open' ? 'Aberto' :
                           ticket.status === 'in_progress' ? 'Em andamento' :
                           ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                        </Badge>
                        {ticket.priority === 'urgent' && (
                          <Badge variant="destructive">Urgente</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {ticket.restaurant?.name}
                        </span>
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
                          variant="outline"
                          onClick={() => updateTicketMutation.mutate({
                            ticketId: ticket.id,
                            status: 'in_progress'
                          })}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Assumir
                        </Button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateTicketMutation.mutate({
                            ticketId: ticket.id,
                            status: 'resolved'
                          })}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!filteredTickets || filteredTickets.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum ticket encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterTicketsView;
