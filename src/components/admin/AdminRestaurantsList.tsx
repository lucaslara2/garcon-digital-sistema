
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminRestaurantsListProps {
  restaurants: any[];
  loadingRestaurants: boolean;
}

const AdminRestaurantsList: React.FC<AdminRestaurantsListProps> = ({ 
  restaurants, 
  loadingRestaurants 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      case 'blocked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
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
  );
};

export default AdminRestaurantsList;
