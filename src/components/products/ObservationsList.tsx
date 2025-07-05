
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface ObservationsListProps {
  products: any[];
}

const ObservationsList = ({ products }: ObservationsListProps) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObservation, setSelectedObservation] = useState<string | null>(null);

  const { data: observations = [] } = useQuery({
    queryKey: ['observations', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_observations')
        .select(`
          *,
          product_observation_assignments(
            product_id,
            products(name)
          )
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const assignObservationMutation = useMutation({
    mutationFn: async ({ observationId, productIds }: { observationId: string, productIds: string[] }) => {
      // Primeiro remove todas as associações existentes
      await supabase
        .from('product_observation_assignments')
        .delete()
        .eq('observation_id', observationId);

      // Depois adiciona as novas associações
      if (productIds.length > 0) {
        const assignments = productIds.map(productId => ({
          observation_id: observationId,
          product_id: productId
        }));

        const { error } = await supabase
          .from('product_observation_assignments')
          .insert(assignments);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Observação atualizada nos produtos!');
      setSelectedObservation(null);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar observação: ' + error.message);
    }
  });

  const deleteObservationMutation = useMutation({
    mutationFn: async (observationId: string) => {
      const { error } = await supabase
        .from('product_observations')
        .delete()
        .eq('id', observationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Observação excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir observação: ' + error.message);
    }
  });

  const filteredObservations = observations.filter(obs =>
    obs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obs.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssignedProducts = (observation: any) => {
    return observation.product_observation_assignments?.map((assignment: any) => assignment.product_id) || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <div className="bg-yellow-600 p-3 rounded-xl mr-3 shadow-sm">
            <Eye className="h-5 w-5 text-white" />
          </div>
          Observações & Acompanhamentos
        </h3>
        <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
          {observations.length} observações
        </Badge>
      </div>

      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar observações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {filteredObservations.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-medium text-gray-700 mb-2">Nenhuma observação encontrada</h4>
          <p className="text-gray-500">Crie observações para personalizar seus produtos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredObservations.map((observation, index) => (
            <Card 
              key={observation.id} 
              className="bg-white border-gray-200 hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">{observation.name}</h4>
                    {observation.description && (
                      <p className="text-gray-600 text-sm mb-3">{observation.description}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                      onClick={() => setSelectedObservation(selectedObservation === observation.id ? null : observation.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                      onClick={() => deleteObservationMutation.mutate(observation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Produtos Associados */}
                {observation.product_observation_assignments?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Produtos com esta observação:</p>
                    <div className="flex flex-wrap gap-1">
                      {observation.product_observation_assignments.map((assignment: any) => (
                        <Badge 
                          key={assignment.product_id} 
                          variant="secondary" 
                          className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                        >
                          {assignment.products?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seleção de Produtos */}
                {selectedObservation === observation.id && (
                  <div className="border-t border-gray-200 pt-4 animate-fade-in">
                    <p className="text-sm font-medium text-gray-900 mb-3">Selecionar produtos para esta observação:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {products.map((product) => {
                        const isAssigned = getAssignedProducts(observation).includes(product.id);
                        return (
                          <div
                            key={product.id}
                            className={`p-2 rounded-lg border cursor-pointer transition-all duration-200 text-sm ${
                              isAssigned
                                ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              const currentProducts = getAssignedProducts(observation);
                              const newProducts = isAssigned
                                ? currentProducts.filter((id: string) => id !== product.id)
                                : [...currentProducts, product.id];
                              
                              assignObservationMutation.mutate({
                                observationId: observation.id,
                                productIds: newProducts
                              });
                            }}
                          >
                            {product.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObservationsList;
