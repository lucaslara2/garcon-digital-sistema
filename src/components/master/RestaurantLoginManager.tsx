
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
  Key, 
  AlertCircle, 
  CheckCircle,
  User,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';

interface RestaurantLoginManagerProps {
  restaurant: any;
}

const RestaurantLoginManager: React.FC<RestaurantLoginManagerProps> = ({ restaurant }) => {
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isViewCredentialsOpen, setIsViewCredentialsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  // Buscar informações de login do restaurante
  const { data: loginInfo, refetch: refetchLoginInfo } = useQuery({
    queryKey: ['restaurant-login-info', restaurant.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_restaurant_login_info', {
        restaurant_id: restaurant.id
      });
      
      if (error) {
        console.error('Erro ao buscar informações de login:', error);
        return null;
      }
      
      return data && data.length > 0 ? data[0] : null;
    }
  });

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

      // Usar a função do banco para atualizar e-mail
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

      setIsChangeEmailOpen(false);
      setNewEmail('');
      refetchLoginInfo();
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
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 6 caracteres.",
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

      // Usar a função do banco para resetar senha
      const { error } = await supabase.rpc('reset_user_password', {
        user_id: loginInfo.user_id,
        new_password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada com sucesso",
        description: "A nova senha foi definida para o restaurante.",
      });

      setIsResetPasswordOpen(false);
      setNewPassword('');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro ao alterar senha",
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
      // Verificar se existe informação de login
      if (!loginInfo || !loginInfo.email) {
        toast({
          title: "Erro",
          description: "Não foram encontradas informações de login para este restaurante. Por favor, configure um e-mail primeiro.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fazendo logout da conta atual...');
      // Fazer logout da conta atual
      await signOut();
      
      // Aguardar um pouco para garantir que o logout foi processado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Tentando login como:', loginInfo.email);
      // Fazer login como o restaurante usando senha padrão
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

      console.log('Login realizado com sucesso:', loginData);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Logado como ${restaurant.name}`,
      });

      // Aguardar um pouco antes de redirecionar
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

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
  };

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            Gerenciar Acesso do Restaurante
          </CardTitle>
          <Badge variant="outline" className="bg-orange-50">
            <User className="h-3 w-3 mr-1" />
            Master Admin
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">E-mail atual:</span>
          </div>
          <span className="text-sm text-gray-600">{loginInfo?.email || restaurant.email || 'Não configurado'}</span>
        </div>

        {loginInfo && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Proprietário:</span>
            </div>
            <span className="text-sm text-blue-600">{loginInfo.name}</span>
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Ver Credenciais */}
          <Dialog open={isViewCredentialsOpen} onOpenChange={setIsViewCredentialsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ver Credenciais
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Credenciais de Acesso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>E-mail de Login</Label>
                  <Input
                    value={loginInfo?.email || restaurant.email || 'Não configurado'}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Senha Padrão</Label>
                  <Input
                    value="temp123456"
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Informações de Acesso</p>
                    <p className="text-blue-700">
                      Use essas credenciais para acessar o sistema como este restaurante.
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Alterar E-mail */}
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

          {/* Alterar Senha */}
          <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Alterar Senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alterar Senha do Restaurante</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateRandomPassword}
                    className="mt-2"
                  >
                    Gerar Senha Aleatória
                  </Button>
                </div>
                <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Atenção</p>
                    <p className="text-yellow-700">
                      Esta ação irá alterar a senha de acesso do restaurante.
                    </p>
                    <p className="text-yellow-700 mt-1">
                      Informe ao cliente a nova senha após a alteração.
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
                    {loading ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Login como Restaurante */}
          <Button 
            onClick={handleLoginAsRestaurant} 
            disabled={loading || !loginInfo}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 col-span-full"
          >
            <User className="h-4 w-4" />
            {loading ? "Entrando..." : "Fazer Login como Restaurante"}
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p><strong>Funcionalidades Disponíveis:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Visualizar credenciais de acesso do restaurante</li>
              <li>Alterar e-mail de login do restaurante</li>
              <li>Definir nova senha de acesso</li>
              <li>Fazer login direto como o restaurante com acesso total ao sistema</li>
              <li>Gerenciar produtos, categorias, pedidos e todas as funcionalidades</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantLoginManager;
