
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminTicketsListProps {
  tickets: any[];
  loadingTickets: boolean;
}

const AdminTicketsList: React.FC<AdminTicketsListProps> = ({ 
  tickets, 
  loadingTickets 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Tickets de Suporte</CardTitle>
        <CardDescription className="text-slate-400">
          Gerenciar chamados de suporte dos restaurantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingTickets ? (
          <div className="text-slate-400">Carregando...</div>
        ) : (
          <div className="space-y-4">
            {tickets?.map((ticket) => (
              <div key={ticket.id} className="p-4 border border-slate-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium">{ticket.title}</h3>
                  <div className="flex space-x-2">
                    <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline" className="text-slate-300 border-slate-600">
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-2">{ticket.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Restaurante: {ticket.restaurant?.name}</span>
                  <span>Por: {ticket.user?.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTicketsList;
