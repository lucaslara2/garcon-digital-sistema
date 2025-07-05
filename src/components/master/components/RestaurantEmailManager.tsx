
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RestaurantEmailManagerProps {
  loginInfo: any;
  restaurant: any;
  onEmailChanged: () => void;
}

const RestaurantEmailManager: React.FC<RestaurantEmailManagerProps> = ({ 
  loginInfo, 
  restaurant, 
  onEmailChanged 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (!loginInfo?.user_id) {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o usuário do restaurante.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.rpc('update_user_email', {
        user_id: loginInfo.user_id,
        new_email: newEmail
      });

      if (error) throw error;

      // Atualizar também o e-mail do restaurante
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .update({ email: newEmail })
        .eq('id', restaurant.id);

      if (restaurantError) throw restaurantError;

      toast({
        title: "E-mail alterado com sucesso",
        description: `E-mail do restaurante alterado para ${newEmail}`,
      });

      setIsOpen(false);
      setNewEmail('');
      onEmailChanged();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar e-mail",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Alterar E-mail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar E-mail do Restaurante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-email">Novo E-mail</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novo@email.com"
            />
          </div>
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Atenção</p>
              <p className="text-yellow-700">
                Esta ação irá alterar o e-mail de login do restaurante no sistema.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleChangeEmail} 
              disabled={loading}
            >
              {loading ? "Alterando..." : "Alterar E-mail"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantEmailManager;
