
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { POSSystem } from '@/components/pos/POSSystem';

const POSPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <POSSystem />
    </div>
  );
};

export default POSPage;
