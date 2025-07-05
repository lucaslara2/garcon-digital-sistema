
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  LogIn, 
  Key, 
  AlertCircle, 
  CheckCircle,
  User,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

interface RestaurantLoginManagerProps {
  restaurant: any;
}

const RestaurantLoginManager: React.FC<RestaurantLoginManagerProps> = ({ restaurant }) => {
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

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
      // Buscar o owner do restaurante
      const { data: ownerProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .eq('role', 'restaurant_owner')
        .single();

      if (!ownerProfile) {
        toast({
          title: "Erro",
          description: "Proprietário do restaurante não encontrado.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar o e-mail na tabela auth.users (isso requer função do servidor)
      const { error } = await supabase.rpc('update_user_email', {
        user_id: ownerProfile.id,
        new_email: newEmail
      });

      if (error) throw error;

      // Atualizar também o e-mail do restaurante se necessário
      await supabase
        .from('restaurants')
        .update({ email: newEmail })
        .eq('id', restaurant.id);

      toast({
        title: "E-mail alterado",
        description: `E-mail do restaurante alterado para ${newEmail}`,
      });

      setIsChangeEmailOpen(false);
      setNewEmail('');
    } catch (error: any) {
      console.error('Erro ao alterar e-mail:', error);
      toast({
        title: "Erro ao alterar e-mail",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      // Buscar o owner do restaurante
      const { data: ownerProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .eq('role', 'restaurant_owner')
        .single();

      if (!ownerProfile) {
        toast({
          title: "Erro",
          description: "Proprietário do restaurante não encontrado.",
          variant: "destructive"
        });
        return;
      }

      // Resetar senha (isso requer função do servidor)
      const { error } = await supabase.rpc('reset_user_password', {
        user_id: ownerProfile.id,
        new_password: 'temp123456'
      });

      if (error) throw error;

      toast({
        title: "Senha resetada",
        description: "Nova senha temporária: temp123456",
      });

      setIsResetPasswordOpen(false);
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAsRestaurant = async () => {
    setLoading(true);
    try {
      // Fazer logout da conta atual
      await signOut();
      
      // Fazer login como o restaurante
      const { error } = await supabase.auth.signInWithPassword({
        email: restaurant.email,
        password: 'temp123456' // Senha padrão ou gerenciada
      });

      if (error) {
        // Se falhar com senha padrão, mostrar opção para resetar
        toast({
          title: "Erro no login",
          description: "Não foi possível fazer login. Tente resetar a senha primeiro.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Login realizado",
        description: `Logado como ${restaurant.name}`,
      });

      // Redirecionar para o dashboard do restaurante
      window.location.href = '/dashboard';
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
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Gerenciar Acesso
          </CardTitle>
          <Badge variant="outline" className="bg-orange-50">
            <User className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">E-mail atual:</span>
          </div>
          <span className="text-sm text-gray-600">{restaurant.email}</span>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Dialog open={isChangeEmailOpen} onOpenChange={setIsChangeEmailOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Alterar E-mail
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsChangeEmailOpen(false)}
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

          <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Resetar Senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resetar Senha do Restaurante</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Atenção</p>
                    <p className="text-yellow-700">
                      A senha será resetada para: <code className="bg-yellow-100 px-1 rounded">temp123456</code>
                    </p>
                    <p className="text-yellow-700 mt-1">
                      Informe ao cliente para alterar após o primeiro login.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsResetPasswordOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleResetPassword} 
                    disabled={loading}
                    variant="destructive"
                  >
                    {loading ? "Resetando..." : "Resetar Senha"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleLoginAsRestaurant} 
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Entrando..." : "Entrar como"}
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p><strong>Funcionalidades:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Alterar e-mail de acesso do restaurante</li>
              <li>Resetar senha para suporte técnico</li>
              <li>Login direto como restaurante para teste</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantLoginManager;
