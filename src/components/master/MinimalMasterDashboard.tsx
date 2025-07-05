
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Ticket, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Shield,
  Settings,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MasterTicketsView from './MasterTicketsView';
import MasterRestaurantsView from './MasterRestaurantsView';
import MasterStaffView from './MasterStaffView';
import ImplementationTicketsView from './ImplementationTicketsView';
import RestaurantRegistrationModal from './RestaurantRegistrationModal';

const MinimalMasterDashboard = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [contextData, setContextData] = useState<{ restaurantId?: string }>({});

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['master-stats'],
    queryFn: async () => {
      const [restaurantsResult, ticketsResult, implementationResult] = await Promise.all([
        supabase.from('restaurants').select('status').eq('status', 'active'),
        supabase.from('tickets').select('status'),
        supabase.from('tickets').select('status').eq('category', 'implementation')
      ]);

      const activeRestaurants = restaurantsResult.data?.length || 0;
      const totalTickets = ticketsResult.data?.length || 0;
      const openTickets = ticketsResult.data?.filter(t => t.status === 'open').length || 0;
      const resolvedTickets = ticketsResult.data?.filter(t => t.status === 'resolved').length || 0;
      const implementationTickets = implementationResult.data?.length || 0;
      const pendingImplementation = implementationResult.data?.filter(t => t.status === 'open').length || 0;

      return {
        activeRestaurants,
        totalTickets,
        openTickets,
        resolvedTickets,
        implementationTickets,
        pendingImplementation,
        resolutionRate: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0
      };
    }
  });

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'restaurants', label: 'Restaurantes', icon: Building2 },
    { id: 'implementation', label: 'Implementação', icon: Settings },
    { id: 'staff', label: 'Equipe', icon: Users }
  ];

  const handleTabClick = (tabId: string) => {
    console.log('Changing tab to:', tabId);
    setActiveTab(tabId);
    // Limpar contexto ao navegar manualmente
    setContextData({});
  };

  const handleNavigateToTab = (tabId: string, restaurantId?: string) => {
    console.log('Navigating to tab:', tabId, 'with restaurant:', restaurantId);
    setActiveTab(tabId);
    if (restaurantId) {
      setContextData({ restaurantId });
    } else {
      setContextData({});
    }
  };

  const handleBack = () => {
    console.log('Going back to overview');
    setActiveTab('overview');
    setContextData({});
  };

  const renderTabContent = () => {
    console.log('Rendering content for tab:', activeTab, 'with context:', contextData);
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Restaurantes Ativos
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.activeRestaurants || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tickets Abertos
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.openTickets || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Taxa de Resolução
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.resolutionRate || 0}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Implementações
                  </CardTitle>
                  <Settings className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.implementationTickets || 0}
                  </div>
                  {stats?.pendingImplementation > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      {stats.pendingImplementation} pendente{stats.pendingImplementation > 1 ? 's' : ''}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total de Tickets
                  </CardTitle>
                  <Ticket className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.totalTickets || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabClick('tickets')}
                    className="justify-start"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Ver Tickets
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabClick('restaurants')}
                    className="justify-start"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Restaurantes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabClick('implementation')}
                    className="justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Implementação
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTabClick('staff')}
                    className="justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Equipe
                  </Button>
                  <Button 
                    variant="outline"
                    className="justify-start"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'tickets':
        return <MasterTicketsView />;
      case 'restaurants':
        return <MasterRestaurantsView onNavigateToTab={handleNavigateToTab} />;
      case 'implementation':
        return <ImplementationTicketsView contextRestaurantId={contextData.restaurantId} />;
      case 'staff':
        return <MasterStaffView />;
      default:
        return <div>Tab não encontrada</div>;
    }
  };

  const showBackButton = contextData.restaurantId && activeTab !== 'overview';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Master</h1>
                <p className="text-gray-600">Gestão completa do sistema</p>
                {contextData.restaurantId && (
                  <p className="text-sm text-blue-600 mt-1">
                    Contexto: Restaurante específico
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RestaurantRegistrationModal />
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                {userProfile?.role === 'admin' ? 'Administrador' : 'Suporte'}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-1 bg-white p-1 rounded-lg border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 ${
                    isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'implementation' && stats?.pendingImplementation > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-1 py-0 min-w-[16px] h-4">
                      {stats.pendingImplementation}
                    </Badge>
                  )}
                  {tab.id === 'implementation' && contextData.restaurantId && (
                    <Badge className="bg-blue-500 text-white text-xs px-1 py-0 min-w-[16px] h-4">
                      •
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MinimalMasterDashboard;
