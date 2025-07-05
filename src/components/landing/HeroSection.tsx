
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-amber-500/5 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.1)_0%,_transparent_50%)]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center animate-fade-in">
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
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg hover:scale-105 transition-transform"
              onClick={() => navigate('/auth')}
            >
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg hover:scale-105 transition-transform"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
