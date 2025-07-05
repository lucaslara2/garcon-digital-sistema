
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Search, 
  Calendar, 
  Mail, 
  Phone,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RestaurantDetailsView from './RestaurantDetailsView';

interface MasterRestaurantsViewProps {
  onNavigateToTab?: (tabId: string, restaurantId?: string) => void;
}

const MasterRestaurantsView: React.FC<MasterRestaurantsViewProps> = ({ onNavigateToTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants-list'],
    queryFn: async () => {
      console.log('Fetching restaurants...');
      
      // Buscar todos os restaurantes sem joins complexos
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (restaurantsError) {
        console.error('Error fetching restaurants:', restaurantsError);
        throw restaurantsError;
      }

      console.log('Restaurants fetched:', restaurantsData?.length || 0);

      // Para cada restaurante, buscar o proprietário
      const restaurantsWithOwners = await Promise.all(
        (restaurantsData || []).map(async (restaurant) => {
          const { data: owners } = await supabase
            .from('user_profiles')
            .select('id, name, role')
            .eq('restaurant_id', restaurant.id)
            .eq('role', 'restaurant_owner')
            .limit(1);
          
          return {
            ...restaurant,
            user_profiles: owners || []
          };
        })
      );

      console.log('Restaurants with owners:', restaurantsWithOwners);
      return restaurantsWithOwners;
    }
  });

  const filteredRestaurants = restaurants?.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cnpj.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'enterprise': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'expired': return 'Expirado';
      case 'blocked': return 'Bloqueado';
      default: return status;
    }
  };

  const getPlanText = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Básico';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Empresarial';
      default: return plan;
    }
  };

  if (selectedRestaurant) {
    return (
      <RestaurantDetailsView 
        restaurantId={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
        onNavigateToTab={onNavigateToTab}
      />
    );
  }

  // Mostrar erro se houver
  if (error) {
    console.error('Query error:', error);
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar restaurantes</h3>
          <p className="text-gray-600 mb-4">
            {error.message || 'Erro desconhecido ao buscar restaurantes'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restaurantes</h2>
          <p className="text-gray-600">Gerencie todos os restaurantes do sistema</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por nome, e-mail ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Debug info */}
      {!isLoading && (
        <div className="text-sm text-gray-500">
          {restaurants?.length ? `${restaurants.length} restaurantes encontrados` : 'Nenhum restaurante encontrado'}
          {filteredRestaurants && filteredRestaurants.length !== restaurants?.length && 
            ` (${filteredRestaurants.length} após filtro)`
          }
        </div>
      )}

      {/* Restaurants Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants?.map((restaurant) => (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{restaurant.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getStatusColor(restaurant.status)} text-white text-xs`}>
                          {getStatusText(restaurant.status)}
                        </Badge>
                        <Badge className={`${getPlanColor(restaurant.plan_type)} text-white text-xs`}>
                          {getPlanText(restaurant.plan_type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{restaurant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{restaurant.phone}</span>
                  </div>
                  {restaurant.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Criado em {format(new Date(restaurant.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Expira em {format(new Date(restaurant.plan_expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  {restaurant.user_profiles && restaurant.user_profiles.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>Proprietário: {restaurant.user_profiles[0].name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRestaurant(restaurant.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToTab?.('implementation', restaurant.id)}
                      className="flex items-center gap-2"
                    >
                      <Building2 className="h-4 w-4" />
                      Implementação
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredRestaurants?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum restaurante encontrado</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Não há restaurantes cadastrados no sistema.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MasterRestaurantsView;
