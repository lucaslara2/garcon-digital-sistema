
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface RestaurantSelectorProps {
  selectedRestaurantId: string | null;
  onRestaurantChange: (restaurantId: string) => void;
  placeholder?: string;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({
  selectedRestaurantId,
  onRestaurantChange,
  placeholder = "Selecione um restaurante"
}) => {
  const { userProfile } = useAuth();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['admin-restaurants-selector'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: userProfile?.role === 'admin'
  });

  if (userProfile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="w-64">
      <Select
        value={selectedRestaurantId || ''}
        onValueChange={onRestaurantChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {restaurants?.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RestaurantSelector;
