
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: "Básico",
    price: "R$ 89",
    period: "/mês",
    features: [
      "Até 5 mesas",
      "2 garçons",
      "1 caixa",
      "Cardápio digital",
      "Relatórios básicos",
      "Suporte por email"
    ]
  },
  {
    name: "Profissional",
    price: "R$ 149",
    period: "/mês",
    featured: true,
    features: [
      "Até 15 mesas",
      "5 garçons",
      "2 caixas",
      "Cardápio digital + QR Code",
      "Relatórios avançados",
      "Sistema de fidelidade",
      "Suporte prioritário"
    ]
  },
  {
    name: "Enterprise",
    price: "R$ 249",
    period: "/mês",
    features: [
      "Mesas ilimitadas",
      "Garçons ilimitados",
      "Caixas ilimitados",
      "Múltiplos restaurantes",
      "API personalizada",
      "Treinamento incluído",
      "Suporte 24/7"
    ]
  }
];

export function PricingSection() {
  const navigate = useNavigate();

  return (
    <div className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Planos que crescem com seu negócio
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu restaurante. Sem taxa de setup, sem fidelidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-slate-800 border-slate-700 transition-all duration-300 hover:scale-105 animate-fade-in ${
                plan.featured ? 'border-amber-500 scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-sm font-medium flex items-center animate-pulse">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-slate-300">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full transition-transform hover:scale-105 ${
                    plan.featured 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  onClick={() => navigate('/auth')}
                >
                  Escolher {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
