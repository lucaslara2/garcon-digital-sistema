
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, DollarSign, Ticket, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminPanel = () => {
  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: tickets, isLoading: loadingTickets } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          restaurant:restaurants(name),
          user:user_profiles(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

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
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-slate-400">Gerenciamento global do sistema SaaS</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Restaurantes
              </CardTitle>
              <Building2 className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {restaurants?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Restaurantes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {restaurants?.filter(r => r.status === 'active').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Tickets Abertos
              </CardTitle>
              <Ticket className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {tickets?.filter(t => t.status === 'open').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ 0,00</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="restaurants" className="text-slate-300">Restaurantes</TabsTrigger>
            <TabsTrigger value="tickets" className="text-slate-300">Tickets</TabsTrigger>
            <TabsTrigger value="reports" className="text-slate-300">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Restaurantes Cadastrados</CardTitle>
                <CardDescription className="text-slate-400">
                  Gerencie todos os restaurantes do sistema
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
                          <p className="text-slate-400 text-sm">Plano: {restaurant.plan_type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(restaurant.status)} text-white`}>
                            {restaurant.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="text-slate-300 border-slate-600">
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Relatórios do Sistema</CardTitle>
                <CardDescription className="text-slate-400">
                  Análise geral do uso do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Relatórios em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
