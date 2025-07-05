
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  CheckCircle,
  User,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RestaurantCredentials from './components/RestaurantCredentials';
import RestaurantEmailManager from './components/RestaurantEmailManager';
import RestaurantPasswordManager from './components/RestaurantPasswordManager';
import RestaurantLoginActions from './components/RestaurantLoginActions';

interface RestaurantLoginManagerProps {
  restaurant: any;
}

const RestaurantLoginManager: React.FC<RestaurantLoginManagerProps> = ({ restaurant }) => {
  // Buscar informações de login do restaurante
  const { data: loginInfo, refetch: refetchLoginInfo } = useQuery({
    queryKey: ['restaurant-login-info', restaurant.id],
    queryFn: async () => {
      console.log('Buscando informações de login para restaurante:', restaurant.id);
      
      // Primeiro garantir que o usuário existe
      const { data: userId, error: ensureError } = await supabase.rpc('ensure_restaurant_user', {
        restaurant_id: restaurant.id
      });

      if (ensureError) {
        console.error('Erro ao garantir usuário do restaurante:', ensureError);
        return null;
      }

      console.log('Usuário garantido, ID:', userId);

      // Agora buscar as informações de login
      const { data, error } = await supabase.rpc('get_restaurant_login_info', {
        restaurant_id: restaurant.id
      });
      
      if (error) {
        console.error('Erro ao buscar informações de login:', error);
        return null;
      }
      
      console.log('Informações de login encontradas:', data);
      return data && data.length > 0 ? data[0] : null;
    }
  });

  const handleDataChanged = () => {
    refetchLoginInfo();
  };

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Gerenciar Acesso do Restaurante
          </CardTitle>
          <Badge variant="outline" className="bg-orange-50">
            <User className="h-3 w-3 mr-1" />
            Master Admin
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">E-mail atual:</span>
          </div>
          <span className="text-sm text-gray-600">{loginInfo?.email || restaurant.email || 'Não configurado'}</span>
        </div>

        {loginInfo && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Proprietário:</span>
            </div>
            <span className="text-sm text-blue-600">{loginInfo.name}</span>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <RestaurantCredentials loginInfo={loginInfo} restaurant={restaurant} />
          
          <RestaurantEmailManager 
            loginInfo={loginInfo} 
            restaurant={restaurant}
            onEmailChanged={handleDataChanged}
          />
          
          <RestaurantPasswordManager 
            loginInfo={loginInfo}
            onPasswordChanged={handleDataChanged}
          />
        </div>

        <RestaurantLoginActions loginInfo={loginInfo} restaurant={restaurant} />

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p><strong>Funcionalidades Disponíveis:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Visualizar credenciais de acesso do restaurante</li>
              <li>Alterar e-mail de login do restaurante</li>
              <li>Definir nova senha de acesso</li>
              <li>Fazer login direto como o restaurante com acesso total ao sistema</li>
              <li>Gerenciar produtos, categorias, pedidos e todas as funcionalidades</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantLoginManager;
