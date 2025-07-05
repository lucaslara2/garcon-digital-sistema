
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/components/AuthProvider';
import SubscriptionCard from './SubscriptionCard';
import { Loader2, RefreshCw, Settings } from 'lucide-react';

const SubscriptionManager: React.FC = () => {
  const { subscription, loading, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  const { userProfile } = useAuth();

  const plans = [
    {
      type: 'basic' as const,
      price: 'R$ 29,90',
      features: [
        'Até 50 pedidos/mês',
        'Menu digital básico',
        'Gestão de estoque',
        'Relatórios básicos',
        'Suporte por email'
      ]
    },
    {
      type: 'premium' as const,
      price: 'R$ 49,90',
      features: [
        'Até 200 pedidos/mês',
        'Menu digital completo',
        'Gestão completa de estoque',
        'Relatórios avançados',
        'Sistema de delivery',
        'Programa de fidelidade',
        'Suporte prioritário'
      ]
    },
    {
      type: 'enterprise' as const,
      price: 'R$ 99,90',
      features: [
        'Pedidos ilimitados',
        'Múltiplas localizações',
        'API personalizada',
        'Relatórios personalizados',
        'Integração WhatsApp',
        'Treinamento personalizado',
        'Suporte 24/7'
      ]
    }
  ];

  const handleSelectPlan = async (planType: string) => {
    if (!userProfile?.restaurant_id) return;
    
    try {
      await createCheckout(planType, userProfile.restaurant_id);
    } catch (error) {
      console.error('Error selecting plan:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando informações da assinatura...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Assinatura Atual */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status da Assinatura</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkSubscription}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                {subscription.subscribed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCustomerPortal}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar
                  </Button>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Informações sobre sua assinatura atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={`${getStatusColor(subscription.status)} text-white`}>
                {subscription.subscribed ? 'Ativo' : 'Inativo'}
              </Badge>
              <span className="font-medium capitalize">
                Plano {subscription.plan_type}
              </span>
              {subscription.current_period_end && (
                <span className="text-sm text-gray-500">
                  Renova em: {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Escolha seu Plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <SubscriptionCard
              key={plan.type}
              planType={plan.type}
              price={plan.price}
              features={plan.features}
              isCurrentPlan={subscription?.plan_type === plan.type && subscription?.subscribed}
              onSelectPlan={() => handleSelectPlan(plan.type)}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
