
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import KitchenDisplay from '@/components/kitchen/KitchenDisplay';

const KitchenPage = () => {
  return (
    <AppLayout>
      <div className="p-6">
        <KitchenDisplay />
      </div>
    </AppLayout>
  );
};

export default KitchenPage;
