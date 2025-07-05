
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Menu, Ticket, BarChart3, Users, Gift } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RestaurantManagement = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', userProfile?.restaurant_id],
    queryFn: async () => {
      if (!userProfile?.restaurant_id) return null;
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', userProfile.restaurant_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const { data: settings } = useQuery({
    queryKey: ['restaurant-settings', userProfile?.restaurant_id],
    queryFn: async () => {
      if (!userProfile?.restaurant_id) return null;
      
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', userProfile.restaurant_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const { error } = await supabase
        .from('restaurant_settings')
        .update(newSettings)
        .eq('restaurant_id', userProfile?.restaurant_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
      toast.success('Configurações atualizadas com sucesso!');
    }
  });

  const handleSettingsUpdate = (field: string, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento do Restaurante</h1>
          <p className="text-slate-400">Configure seu restaurante e gerencie operações</p>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800">
            <TabsTrigger value="settings" className="text-slate-300">Configurações</TabsTrigger>
            <TabsTrigger value="menu" className="text-slate-300">Cardápio</TabsTrigger>
            <TabsTrigger value="promotions" className="text-slate-300">Promoções</TabsTrigger>
            <TabsTrigger value="reports" className="text-slate-300">Relatórios</TabsTrigger>
            <TabsTrigger value="staff" className="text-slate-300">Funcionários</TabsTrigger>
            <TabsTrigger value="support" className="text-slate-300">Suporte</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="restaurant-name" className="text-slate-300">Nome do Restaurante</Label>
                      <Input
                        id="restaurant-name"
                        defaultValue={restaurant?.name}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="restaurant-address" className="text-slate-300">Endereço</Label>
                      <Textarea
                        id="restaurant-address"
                        defaultValue={restaurant?.address}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="printer-ip" className="text-slate-300">IP da Impressora</Label>
                      <Input
                        id="printer-ip"
                        defaultValue={settings?.printer_ip}
                        placeholder="192.168.1.100"
                        className="bg-slate-700 border-slate-600 text-white"
                        onChange={(e) => handleSettingsUpdate('printer_ip', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Formas de Pagamento</h3>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="accepts-cash" className="text-slate-300">Dinheiro</Label>
                        <Switch
                          id="accepts-cash"
                          checked={settings?.accepts_cash}
                          onCheckedChange={(checked) => handleSettingsUpdate('accepts_cash', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="accepts-card" className="text-slate-300">Cartão</Label>
                        <Switch
                          id="accepts-card"
                          checked={settings?.accepts_card}
                          onCheckedChange={(checked) => handleSettingsUpdate('accepts_card', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="accepts-pix" className="text-slate-300">PIX</Label>
                        <Switch
                          id="accepts-pix"
                          checked={settings?.accepts_pix}
                          onCheckedChange={(checked) => handleSettingsUpdate('accepts_pix', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Sistema de Pontos</h3>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="points-enabled" className="text-slate-300">Ativar Pontos</Label>
                        <Switch
                          id="points-enabled"
                          checked={settings?.points_enabled}
                          onCheckedChange={(checked) => handleSettingsUpdate('points_enabled', checked)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="points-rate" className="text-slate-300">Pontos por Real</Label>
                        <Input
                          id="points-rate"
                          type="number"
                          defaultValue={settings?.points_rate}
                          className="bg-slate-700 border-slate-600 text-white"
                          onChange={(e) => handleSettingsUpdate('points_rate', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Menu className="mr-2 h-5 w-5" />
                  Gerenciar Cardápio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <Menu className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Gerenciamento de cardápio em desenvolvimento</p>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    Adicionar Produto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="mr-2 h-5 w-5" />
                  Promoções e Cupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Sistema de promoções em desenvolvimento</p>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    Criar Promoção
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Relatórios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Relatórios em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Gerenciar Funcionários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Gerenciamento de funcionários em desenvolvimento</p>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    Adicionar Funcionário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Ticket className="mr-2 h-5 w-5" />
                  Suporte Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-slate-400 text-center py-8">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                  <p>Sistema de tickets em desenvolvimento</p>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    Abrir Chamado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantManagement;
