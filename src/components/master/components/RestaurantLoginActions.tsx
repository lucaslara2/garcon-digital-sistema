
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

interface RestaurantLoginActionsProps {
  loginInfo: any;
  restaurant: any;
}

const RestaurantLoginActions: React.FC<RestaurantLoginActionsProps> = ({ 
  loginInfo, 
  restaurant 
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleLoginAsRestaurant = async () => {
    setLoading(true);
    try {
      if (!loginInfo || !loginInfo.email) {
        toast({
          title: "Erro",
          description: "Não foram encontradas informações de login para este restaurante.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fazendo logout da conta atual...');
      await signOut();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Tentando login como:', loginInfo.email);
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: loginInfo.email,
        password: 'temp123456'
      });

      if (loginError) {
        console.error('Erro no login:', loginError);
        toast({
          title: "Erro no login",
          description: "Não foi possível fazer login. Verifique se as credenciais estão corretas.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso",
        description: `Logado como ${restaurant.name}`,
      });

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLoginAsRestaurant} 
      disabled={loading || !loginInfo}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full"
    >
      <User className="h-4 w-4" />
      {loading ? "Entrando..." : "Fazer Login como Restaurante"}
    </Button>
  );
};

export default RestaurantLoginActions;
