
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, ArrowLeft } from 'lucide-react';

interface LoginFormProps {
  onSuccess: (client: any) => void;
  onBack: () => void;
}

export const LoginForm = ({ onSuccess, onBack }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Buscar cliente por telefone
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', loginData.phone)
        .eq('password_hash', loginData.password) // Em produção usar hash seguro
        .single();

      if (error || !client) {
        toast.error('Telefone ou senha incorretos');
        return;
      }

      // Atualizar último login
      await supabase
        .from('clients')
        .update({ last_login: new Date().toISOString() })
        .eq('id', client.id);

      toast.success('Login realizado com sucesso!');
      onSuccess(client);
    } catch (error: any) {
      toast.error('Erro ao fazer login: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se telefone já existe
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', registerData.phone)
        .single();

      if (existingClient) {
        toast.error('Este telefone já está cadastrado');
        return;
      }

      // Criar novo cliente
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert({
          name: registerData.name,
          phone: registerData.phone,
          email: registerData.email,
          password_hash: registerData.password, // Em produção usar hash seguro
          username: registerData.phone,
          restaurant_id: window.location.pathname.split('/')[2] // pegar do URL
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Cadastro realizado com sucesso!');
      onSuccess(newClient);
    } catch (error: any) {
      toast.error('Erro ao fazer cadastro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="max-w-md mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao Cardápio
      </Button>

      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Acesso do Cliente</CardTitle>
          <CardDescription>
            Faça login ou crie sua conta para finalizar o pedido
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-phone">Telefone</Label>
                  <Input
                    id="login-phone"
                    type="tel"
                    value={loginData.phone}
                    onChange={(e) => setLoginData(prev => ({
                      ...prev,
                      phone: formatPhone(e.target.value)
                    }))}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Nome Completo</Label>
                  <Input
                    id="register-name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-phone">Telefone</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      phone: formatPhone(e.target.value)
                    }))}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="register-confirm">Confirmar Senha</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
