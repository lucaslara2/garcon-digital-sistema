
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import RestaurantSelector from '@/components/admin/RestaurantSelector';

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCategoryModal = ({ open, onOpenChange }: CreateCategoryModalProps) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<string | null>(null);

  const isAdmin = userProfile?.role === 'admin';
  const effectiveRestaurantId = isAdmin ? selectedRestaurantId : userProfile?.restaurant_id;

  const createCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!effectiveRestaurantId) {
        throw new Error('Restaurante deve ser selecionado');
      }

      const categoryData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        display_order: parseInt(formData.get('display_order') as string) || 0,
        restaurant_id: effectiveRestaurantId,
        is_active: true
      };

      const { data, error } = await supabase
        .from('product_categories')
        .insert(categoryData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onOpenChange(false);
      setSelectedRestaurantId(null);
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isAdmin && !selectedRestaurantId) {
      toast.error('Por favor, selecione um restaurante');
      return;
    }

    const formData = new FormData(e.currentTarget);
    createCategoryMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-gray-200 animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold">Criar Nova Categoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {isAdmin && (
            <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
              <Label className="text-gray-700 font-medium">Restaurante</Label>
              <div className="mt-1">
                <RestaurantSelector
                  selectedRestaurantId={selectedRestaurantId}
                  onRestaurantChange={setSelectedRestaurantId}
                  placeholder="Selecione o restaurante"
                />
              </div>
            </div>
          )}

          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Label htmlFor="name" className="text-gray-700 font-medium">Nome da Categoria</Label>
            <Input
              id="name"
              name="name"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
              placeholder="Ex: Pizzas, Bebidas, Sobremesas"
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <Label htmlFor="description" className="text-gray-700 font-medium">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
              placeholder="Descreva a categoria..."
              rows={3}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Label htmlFor="display_order" className="text-gray-700 font-medium">Ordem de Exibição</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              min="0"
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
              placeholder="0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-5 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              disabled={createCategoryMutation.isPending || (isAdmin && !selectedRestaurantId)}
            >
              {createCategoryMutation.isPending ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal;
