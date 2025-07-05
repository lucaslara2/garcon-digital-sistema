
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Users, Plus, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  message: string;
  image_url?: string;
  coupon_code?: string;
  discount_percentage?: number;
  target_audience: string;
  sent_count: number;
  status: string;
  sent_at?: string;
  created_at: string;
}

interface WhatsAppManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppManager({ isOpen, onClose }: WhatsAppManagerProps) {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    message: '',
    image_url: '',
    coupon_code: '',
    discount_percentage: 0,
    target_audience: 'all'
  });

  // Buscar campanhas
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['pos-campaigns', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_campaigns')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: isOpen && !!userProfile?.restaurant_id
  });

  // Buscar total de clientes
  const { data: clientsCount } = useQuery({
    queryKey: ['pos-clients-count', userProfile?.restaurant_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('is_active', true)
        .eq('is_whatsapp_enabled', true);

      if (error) throw error;
      return count || 0;
    },
    enabled: isOpen && !!userProfile?.restaurant_id
  });

  // Criar campanha
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: typeof newCampaign) => {
      const { data, error } = await supabase
        .from('whatsapp_campaigns')
        .insert({
          ...campaignData,
          restaurant_id: userProfile?.restaurant_id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-campaigns'] });
      setNewCampaign({
        title: '',
        message: '',
        image_url: '',
        coupon_code: '',
        discount_percentage: 0,
        target_audience: 'all'
      });
      setShowNewCampaign(false);
      toast.success('Campanha criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar campanha: ' + error.message);
    }
  });

  // Enviar campanha (simulado)
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      // Simular envio - em produção, integrar com API do WhatsApp
      const { error } = await supabase
        .from('whatsapp_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: clientsCount || 0
        })
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-campaigns'] });
      toast.success('Campanha enviada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao enviar campanha: ' + error.message);
    }
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.message) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }
    createCampaignMutation.mutate(newCampaign);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'draft': return 'Rascunho';
      case 'scheduled': return 'Agendada';
      default: return 'Desconhecido';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Campanhas WhatsApp
            </DialogTitle>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {clientsCount} clientes
              </Badge>
              <Button onClick={() => setShowNewCampaign(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formulário nova campanha */}
          {showNewCampaign && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nova Campanha</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título da Campanha *</Label>
                    <Input
                      id="title"
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Promoção de Fim de Semana"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={newCampaign.message}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="🔥 Oferta especial! Hambúrguer + Batata + Refri por apenas R$ 25,90..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coupon">Código do Cupom</Label>
                      <Input
                        id="coupon"
                        value={newCampaign.coupon_code}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, coupon_code: e.target.value }))}
                        placeholder="PROMO20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Desconto (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={newCampaign.discount_percentage}
                        onChange={(e) => setNewCampaign(prev => ({ ...prev, discount_percentage: Number(e.target.value) }))}
                        placeholder="20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image">URL da Imagem</Label>
                    <Input
                      id="image"
                      type="url"
                      value={newCampaign.image_url}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createCampaignMutation.isPending}>
                      {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewCampaign(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de campanhas */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">Carregando campanhas...</div>
            ) : campaigns?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma campanha encontrada
              </div>
            ) : (
              campaigns?.map(campaign => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-lg">{campaign.title}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getStatusText(campaign.status)}
                          </Badge>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {campaign.message}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {campaign.sent_count > 0 && (
                            <span>Enviada para {campaign.sent_count} pessoas</span>
                          )}
                          {campaign.coupon_code && (
                            <span>Cupom: {campaign.coupon_code}</span>
                          )}
                          {campaign.discount_percentage > 0 && (
                            <span>{campaign.discount_percentage}% desconto</span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm"
                            onClick={() => sendCampaignMutation.mutate(campaign.id)}
                            disabled={sendCampaignMutation.isPending}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
