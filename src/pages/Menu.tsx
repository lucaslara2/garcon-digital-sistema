
import React from 'react';
import { useParams } from 'react-router-dom';
import DigitalMenu from '@/components/menu/DigitalMenu';

const Menu = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();

  if (!restaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro</h1>
          <p className="text-gray-600">ID do restaurante não encontrado</p>
        </div>
      </div>
    );
  }

  return <DigitalMenu restaurantId={restaurantId} />;
};

export default Menu;
