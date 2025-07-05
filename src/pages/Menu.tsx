
import React from 'react';
import { useParams } from 'react-router-dom';
import DigitalMenu from '@/components/menu/DigitalMenu';

const Menu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Restaurante não encontrado</h1>
          <p className="text-slate-600">O ID do restaurante não foi fornecido.</p>
        </div>
      </div>
    );
  }

  return <DigitalMenu restaurantId={restaurantId} />;
};

export default Menu;
