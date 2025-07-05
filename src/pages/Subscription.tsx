
import React from 'react';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

const Subscription: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Gerenciar Assinatura</h1>
          <p className="text-gray-600">
            Escolha o plano ideal para seu restaurante e gerencie sua assinatura
          </p>
        </div>
        
        <SubscriptionManager />
      </div>
    </div>
  );
};

export default Subscription;
