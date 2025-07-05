
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { KitchenDisplay } from '@/components/kitchen/KitchenDisplay';

const KitchenPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <KitchenDisplay />
      </div>
    </div>
  );
};

export default KitchenPage;
