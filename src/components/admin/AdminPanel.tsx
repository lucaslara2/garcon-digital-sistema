
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminStats from './AdminStats';
import AdminRestaurantsList from './AdminRestaurantsList';
import AdminTicketsList from './AdminTicketsList';
import AdminReports from './AdminReports';

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
          user:user_profiles!tickets_user_id_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-slate-400">Gerenciamento global do sistema SaaS</p>
        </div>

        <AdminStats restaurants={restaurants || []} tickets={tickets || []} />

        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="restaurants" className="text-slate-300">Restaurantes</TabsTrigger>
            <TabsTrigger value="tickets" className="text-slate-300">Tickets</TabsTrigger>
            <TabsTrigger value="reports" className="text-slate-300">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="restaurants" className="space-y-4">
            <AdminRestaurantsList 
              restaurants={restaurants || []} 
              loadingRestaurants={loadingRestaurants} 
            />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <AdminTicketsList 
              tickets={tickets || []} 
              loadingTickets={loadingTickets} 
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <AdminReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
