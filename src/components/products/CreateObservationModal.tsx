
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateObservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateObservationModal = ({ open, onOpenChange }: CreateObservationModalProps) => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const createObservationMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const observationData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        restaurant_id: userProfile?.restaurant_id,
        is_active: true
      };

      const { data, error } = await supabase
        .from('product_observations')
        .insert(observationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      onOpenChange(false);
      toast.success('Observação criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar observação: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createObservationMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border-gray-200 animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-xl font-semibold flex items-center">
            <div className="bg-yellow-600 p-3 rounded-xl mr-3 shadow-sm">
              <Eye className="h-5 w-5 text-white" />
            </div>
            Nova Observação
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Label htmlFor="name" className="text-gray-700 font-medium">Nome da Observação</Label>
            <Input
              id="name"
              name="name"
              required
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
              placeholder="Ex: Sem cebola, Ponto da carne, Extra queijo"
            />
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <Label htmlFor="description" className="text-gray-700 font-medium">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mt-1"
              placeholder="Descreva a observação..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
              disabled={createObservationMutation.isPending}
            >
              {createObservationMutation.isPending ? 'Criando...' : 'Criar Observação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateObservationModal;
