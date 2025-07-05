
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-amber-600 to-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
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
              className="bg-white text-amber-700 hover:bg-slate-100 px-8 py-3 text-lg font-semibold hover:scale-105 transition-transform"
              onClick={() => navigate('/auth')}
            >
              Começar Teste Grátis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg hover:scale-105 transition-transform"
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
