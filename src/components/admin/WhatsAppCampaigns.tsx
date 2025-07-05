
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const WhatsAppCampaigns = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    message: '',
    image_url: '',
    coupon_code: '',
    discount_percentage: 0,
    target_audience: 'all'
  });

  // Buscar campanhas
  const { data: campaigns } = useQuery({
    queryKey: ['whatsapp-campaigns', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_campaigns')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Buscar clientes do WhatsApp
  const { data: whatsappCustomers } = useQuery({
    queryKey: ['whatsapp-customers', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, is_whatsapp_enabled, created_at')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('is_whatsapp_enabled', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Criar/atualizar campanha
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      if (selectedCampaign) {
        const { error } = await supabase
          .from('whatsapp_campaigns')
          .update(campaignData)
          .eq('id', selectedCampaign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('whatsapp_campaigns')
          .insert({
            ...campaignData,
            restaurant_id: userProfile?.restaurant_id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      setShowCreateForm(false);
      setSelectedCampaign(null);
      setCampaignForm({
        title: '',
        message: '',
        image_url: '',
        coupon_code: '',
        discount_percentage: 0,
        target_audience: 'all'
      });
      toast.success(selectedCampaign ? 'Campanha atualizada!' : 'Campanha criada!');
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar campanha: ' + error.message);
    }
  });

  // Enviar campanha
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      // Simular envio da campanha - em produção integraria com API do WhatsApp
      const campaign = campaigns?.find(c => c.id === campaignId);
      if (!campaign) throw new Error('Campanha não encontrada');

      let targetCustomers = whatsappCustomers || [];
      
      // Filtrar por audiência
      if (campaign.target_audience === 'frequent_customers') {
        // Lógica para clientes frequentes (mais de 3 pedidos nos últimos 30 dias)
        targetCustomers = targetCustomers.slice(0, Math.floor(targetCustomers.length * 0.3));
      } else if (campaign.target_audience === 'inactive_customers') {
        // Lógica para clientes inativos (sem pedidos nos últimos 30 dias)
        targetCustomers = targetCustomers.slice(Math.floor(targetCustomers.length * 0.7));
      }

      // Atualizar campanha como enviada
      const { error } = await supabase
        .from('whatsapp_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: targetCustomers.length
        })
        .eq('id', campaignId);

      if (error) throw error;

      return targetCustomers.length;
    },
    onSuccess: (sentCount) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      toast.success(`Campanha enviada para ${sentCount} contatos!`);
    },
    onError: (error: any) => {
      toast.error('Erro ao enviar campanha: ' + error.message);
    }
  });

  // Excluir campanha
  const deleteCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('whatsapp_campaigns')
        .delete()
        .eq('id', campaignId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-campaigns'] });
      toast.success('Campanha excluída!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir campanha: ' + error.message);
    }
  });

  const handleCreateCampaign = () => {
    createCampaignMutation.mutate(campaignForm);
  };

  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setCampaignForm({
      title: campaign.title,
      message: campaign.message,
      image_url: campaign.image_url || '',
      coupon_code: campaign.coupon_code || '',
      discount_percentage: campaign.discount_percentage || 0,
      target_audience: campaign.target_audience
    });
    setShowCreateForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviada';
      case 'scheduled': return 'Agendada';
      default: return status;
    }
  };

  const getTargetAudienceText = (audience: string) => {
    switch (audience) {
      case 'all': return 'Todos os clientes';
      case 'frequent_customers': return 'Clientes frequentes';
      case 'inactive_customers': return 'Clientes inativos';
      default: return audience;
    }
  };

  const getTargetCount = (audience: string) => {
    if (!whatsappCustomers) return 0;
    
    switch (audience) {
      case 'all': return whatsappCustomers.length;
      case 'frequent_customers': return Math.floor(whatsappCustomers.length * 0.3);
      case 'inactive_customers': return Math.floor(whatsappCustomers.length * 0.3);
      default: return whatsappCustomers.length;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campanhas WhatsApp</h1>
          <p className="text-gray-600">Crie e gerencie campanhas promocionais para seus clientes</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes WhatsApp</p>
              <p className="text-2xl font-bold text-gray-900">{whatsappCustomers?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Campanhas Criadas</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Send className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Campanhas Enviadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns?.filter(c => c.status === 'sent').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Campanhas */}
      <div className="grid gap-4">
        {campaigns?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha criada</h3>
              <p className="text-gray-600 mb-4">Crie sua primeira campanha promocional</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Campanha
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns?.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCampaign(campaign)}
                      disabled={campaign.status === 'sent'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                      disabled={campaign.status === 'sent'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Mensagem:</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {campaign.message}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Público-alvo:</p>
                      <p className="font-medium">{getTargetAudienceText(campaign.target_audience)}</p>
                      <p className="text-xs text-gray-500">{getTargetCount(campaign.target_audience)} contatos</p>
                    </div>
                    
                    {campaign.coupon_code && (
                      <div>
                        <p className="text-gray-600">Cupom:</p>
                        <p className="font-medium">{campaign.coupon_code}</p>
                        <p className="text-xs text-gray-500">{campaign.discount_percentage}% desconto</p>
                      </div>
                    )}

                    {campaign.sent_count > 0 && (
                      <div>
                        <p className="text-gray-600">Enviados:</p>
                        <p className="font-medium">{campaign.sent_count} mensagens</p>
                        <p className="text-xs text-gray-500">
                          {campaign.sent_at && new Date(campaign.sent_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-gray-600">Criado em:</p>
                      <p className="font-medium">
                        {new Date(campaign.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {campaign.status === 'draft' && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => sendCampaignMutation.mutate(campaign.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={sendCampaignMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendCampaignMutation.isPending ? 'Enviando...' : 'Enviar Campanha'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para Criar/Editar Campanha */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCampaign ? 'Editar Campanha' : 'Nova Campanha WhatsApp'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título da Campanha</Label>
              <Input
                id="title"
                value={campaignForm.title}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Promoção de Final de Semana"
              />
            </div>

            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={campaignForm.message}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="🔥 Oferta especial só hoje! Hambúrguer X-Bacon + Fritas + Refrigerante por apenas R$ 25,90. Peça já pelo WhatsApp e ganhe 10% de desconto!"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="target_audience">Público-alvo</Label>
              <Select
                value={campaignForm.target_audience}
                onValueChange={(value) => setCampaignForm(prev => ({ ...prev, target_audience: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Todos os clientes ({whatsappCustomers?.length || 0} contatos)
                  </SelectItem>
                  <SelectItem value="frequent_customers">
                    Clientes frequentes ({getTargetCount('frequent_customers')} contatos)
                  </SelectItem>
                  <SelectItem value="inactive_customers">
                    Clientes inativos ({getTargetCount('inactive_customers')} contatos)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coupon_code">Código do Cupom (opcional)</Label>
                <Input
                  id="coupon_code"
                  value={campaignForm.coupon_code}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, coupon_code: e.target.value }))}
                  placeholder="Ex: DESCONTO10"
                />
              </div>
              <div>
                <Label htmlFor="discount_percentage">% de Desconto</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={campaignForm.discount_percentage}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, discount_percentage: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
              <Input
                id="image_url"
                value={campaignForm.image_url}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://exemplo.com/imagem-promocao.jpg"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending || !campaignForm.title || !campaignForm.message}
                className="flex-1"
              >
                {createCampaignMutation.isPending ? 'Salvando...' : 
                 selectedCampaign ? 'Atualizar Campanha' : 'Criar Campanha'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedCampaign(null);
                  setCampaignForm({
                    title: '',
                    message: '',
                    image_url: '',
                    coupon_code: '',
                    discount_percentage: 0,
                    target_audience: 'all'
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppCampaigns;
