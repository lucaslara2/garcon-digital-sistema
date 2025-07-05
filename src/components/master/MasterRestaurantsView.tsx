
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Building2, Mail, Phone, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type RestaurantStatus = Database['public']['Enums']['restaurant_status'];

const MasterRestaurantsView = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

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
      toast.success('Status do restaurante atualizado!');
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Restaurantes ({restaurants?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando restaurantes...</div>
          ) : (
            <div className="space-y-4">
              {restaurants?.map((restaurant) => (
                <div key={restaurant.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                        {getStatusIcon(restaurant.status)}
                        <Badge className={getStatusColor(restaurant.status)}>
                          {restaurant.status === 'active' ? 'Ativo' :
                           restaurant.status === 'pending' ? 'Pendente' :
                           restaurant.status === 'expired' ? 'Expirado' : 'Bloqueado'}
                        </Badge>
                        <Badge variant="outline">
                          {restaurant.plan_type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {restaurant.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {restaurant.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expira: {new Date(restaurant.plan_expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {userProfile?.role === 'admin' && (
                      <div className="flex gap-2 ml-4">
                        {restaurant.status !== 'active' && (
                          <Button
                            size="sm"
                            onClick={() => updateRestaurantMutation.mutate({
                              restaurantId: restaurant.id,
                              status: 'active' as RestaurantStatus
                            })}
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
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Bloquear
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!restaurants || restaurants.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum restaurante cadastrado</p>
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
