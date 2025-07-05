
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminReports: React.FC = () => {
  const { data: subscriptionStats } = useQuery({
    queryKey: ['admin-subscription-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_subscriptions')
        .select('status, plan_type');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        active: data.filter(sub => sub.status === 'active').length,
        inactive: data.filter(sub => sub.status === 'inactive').length,
        basic: data.filter(sub => sub.plan_type === 'basic').length,
        premium: data.filter(sub => sub.plan_type === 'premium').length,
        enterprise: data.filter(sub => sub.plan_type === 'enterprise').length,
      };
      
      return stats;
    }
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_invoices')
        .select('amount_paid, status')
        .eq('status', 'paid');
      
      if (error) throw error;
      
      const totalRevenue = data.reduce((sum, invoice) => sum + invoice.amount_paid, 0);
      
      return {
        totalRevenue: totalRevenue / 100, // Convert from cents to reais
        totalInvoices: data.length
      };
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Relatórios do Sistema
          </CardTitle>
          <CardDescription className="text-slate-400">
            Análise geral do uso do sistema e receitas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Assinaturas */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Restaurantes</p>
                  <p className="text-white text-2xl font-bold">
                    {subscriptionStats?.total || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            {/* Assinaturas Ativas */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Assinaturas Ativas</p>
                  <p className="text-white text-2xl font-bold">
                    {subscriptionStats?.active || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            {/* Receita Total */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Receita Total</p>
                  <p className="text-white text-2xl font-bold">
                    R$ {revenueData?.totalRevenue?.toFixed(2) || '0,00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            {/* Faturas Pagas */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Faturas Pagas</p>
                  <p className="text-white text-2xl font-bold">
                    {revenueData?.totalInvoices || 0}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Distribuição por Planos */}
          {subscriptionStats && (
            <div className="mt-6">
              <h3 className="text-white font-medium mb-4">Distribuição por Planos</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700 p-3 rounded text-center">
                  <p className="text-slate-400 text-sm">Básico</p>
                  <p className="text-white text-xl font-bold">{subscriptionStats.basic}</p>
                </div>
                <div className="bg-slate-700 p-3 rounded text-center">
                  <p className="text-slate-400 text-sm">Premium</p>
                  <p className="text-white text-xl font-bold">{subscriptionStats.premium}</p>
                </div>
                <div className="bg-slate-700 p-3 rounded text-center">
                  <p className="text-slate-400 text-sm">Enterprise</p>
                  <p className="text-white text-xl font-bold">{subscriptionStats.enterprise}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
