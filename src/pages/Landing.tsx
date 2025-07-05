
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChefHat, 
  Users, 
  CreditCard, 
  Smartphone,
  BarChart3,
  Gift,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f59e0b" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <ChefHat className="h-16 w-16 text-amber-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sistema Garçon Digital
              <span className="block text-amber-500 mt-2">Para Restaurantes</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              A solução completa para gerenciar seu restaurante com eficiência. 
              Garçons, caixa, cardápio digital e relatórios - tudo em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
                onClick={() => navigate('/auth')}
              >
                Começar Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tudo que seu restaurante precisa
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Uma plataforma completa com todos os recursos necessários para modernizar e otimizar seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700 hover:border-amber-500/50 transition-colors">
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

      {/* Pricing Section */}
      <div className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
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
                className={`relative bg-slate-800 border-slate-700 ${
                  plan.featured ? 'border-amber-500 scale-105' : ''
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-sm font-medium flex items-center">
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
                    className={`w-full ${
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

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para revolucionar seu restaurante?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Junte-se a centenas de restaurantes que já modernizaram sua operação
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-amber-700 hover:bg-slate-100 px-8 py-3 text-lg font-semibold"
              onClick={() => navigate('/auth')}
            >
              Começar Teste Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
            >
              Falar com Consultor
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <ChefHat className="h-8 w-8 text-amber-500" />
              <span className="text-xl font-bold text-white">Sistema Garçon Digital</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 Sistema Garçon Digital. Todos os direitos reservados.</p>
              <p className="mt-1">Suporte: contato@garcondigital.com.br</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
