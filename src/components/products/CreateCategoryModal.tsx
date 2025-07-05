
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

interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCategoryModal = ({ open, onOpenChange }: CreateCategoryModalProps) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const categoryData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        display_order: parseInt(formData.get('display_order') as string) || 0,
        restaurant_id: userProfile?.restaurant_id,
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
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCategoryMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Criar Nova Categoria</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-300">Nome da Categoria</Label>
            <Input
              id="name"
              name="name"
              required
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Ex: Pizzas, Bebidas, Sobremesas"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-slate-300">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Descreva a categoria..."
            />
          </div>

          <div>
            <Label htmlFor="display_order" className="text-slate-300">Ordem de Exibição</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              min="0"
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={createCategoryMutation.isPending}
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
