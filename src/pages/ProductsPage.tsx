
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import MenuManager from '@/components/menu/MenuManager';

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto">
        <MenuManager />
      </div>
    </div>
  );
};

export default ProductsPage;
