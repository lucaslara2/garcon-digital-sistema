
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import RestaurantSelector from '@/components/admin/RestaurantSelector';

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
  editingProduct?: any;
}

const CreateProductModal = ({ open, onOpenChange, categories, editingProduct }: CreateProductModalProps) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRestaurantId, setSelectedRestaurantId] = React.useState<string | null>(null);

  const isAdmin = userProfile?.role === 'admin';
  const effectiveRestaurantId = isAdmin ? selectedRestaurantId : userProfile?.restaurant_id;

  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!effectiveRestaurantId) {
        throw new Error('Restaurante deve ser selecionado');
      }

      const productData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        cost_price: parseFloat(formData.get('cost_price') as string) || 0,
        category_id: formData.get('category_id') as string || null,
        image_url: formData.get('image_url') as string || null,
        restaurant_id: effectiveRestaurantId,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create initial inventory record
      const initialStock = parseInt(formData.get('initial_stock') as string) || 0;
      const minStock = parseInt(formData.get('min_stock') as string) || 0;
      const maxStock = parseInt(formData.get('max_stock') as string) || 100;
      const unitCost = parseFloat(formData.get('unit_cost') as string) || 0;
      
      if (initialStock > 0 || minStock > 0 || maxStock > 0) {
        await supabase
          .from('inventory')
          .insert({
            product_id: data.id,
            restaurant_id: effectiveRestaurantId,
            current_stock: initialStock,
            min_stock: minStock,
            max_stock: maxStock,
            unit_cost: unitCost > 0 ? unitCost : null
          });
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      setSelectedRestaurantId(null);
      toast.success('Produto criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar produto: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isAdmin && !selectedRestaurantId) {
      toast.error('Por favor, selecione um restaurante');
      return;
    }

    const formData = new FormData(e.currentTarget);
    createProductMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-gray-200 animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold">Criar Novo Produto</DialogTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="name" className="text-gray-700 font-medium">Nome do Produto</Label>
              <Input
                id="name"
                name="name"
                required
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                placeholder="Ex: Pizza Margherita"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <Label htmlFor="category_id" className="text-gray-700 font-medium">Categoria</Label>
              <Select name="category_id">
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 animate-scale-in">
                  {categories?.map((category) => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id} 
                      className="text-gray-900 hover:bg-gray-50 focus:bg-blue-50 focus:text-blue-900 transition-colors duration-200"
                    >
                      {category.name}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="cost_price" className="text-gray-700 font-medium">Preço de Custo</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                placeholder="0.00"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <Label htmlFor="price" className="text-gray-700 font-medium">Preço de Venda</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Label htmlFor="description" className="text-gray-700 font-medium">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
              placeholder="Descreva o produto..."
              rows={3}
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <Label htmlFor="image_url" className="text-gray-700 font-medium">URL da Imagem</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="border-t border-gray-200 pt-5 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h4 className="text-gray-900 font-semibold mb-4 text-lg">Controle de Estoque (Opcional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initial_stock" className="text-gray-700 font-medium">Estoque Inicial</Label>
                <Input
                  id="initial_stock"
                  name="initial_stock"
                  type="number"
                  min="0"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="unit_cost" className="text-gray-700 font-medium">Custo Inventário</Label>
                <Input
                  id="unit_cost"
                  name="unit_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="min_stock" className="text-gray-700 font-medium">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  name="min_stock"
                  type="number"
                  min="0"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="max_stock" className="text-gray-700 font-medium">Estoque Máximo</Label>
                <Input
                  id="max_stock"
                  name="max_stock"
                  type="number"
                  min="0"
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-5 animate-fade-in" style={{ animationDelay: '0.45s' }}>
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
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? 'Criando...' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductModal;
