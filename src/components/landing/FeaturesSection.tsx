
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  CreditCard, 
  Smartphone,
  BarChart3,
  Gift,
  ChefHat
} from 'lucide-react';

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Gestão de Garçons",
    description: "Controle de mesas, comandas e pedidos em tempo real"
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "PDV Completo",
    description: "Sistema de caixa com múltiplas formas de pagamento"
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Cardápio Digital",
    description: "QR Code para pedidos diretos dos clientes"
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Relatórios Avançados",
    description: "Análise de vendas e performance em tempo real"
  },
  {
    icon: <Gift className="h-6 w-6" />,
    title: "Marketing & Fidelidade",
    description: "Cupons, promoções e programa de pontos"
  },
  {
    icon: <ChefHat className="h-6 w-6" />,
    title: "Gestão Completa",
    description: "Cardápio, estoque, funcionários e muito mais"
  }
];

export function FeaturesSection() {
  return (
    <div className="py-24 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Tudo que seu restaurante precisa
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Uma plataforma completa com todos os recursos necessários para modernizar e otimizar seu negócio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-slate-800 border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="text-amber-500">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
