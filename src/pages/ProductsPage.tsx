
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import ProductsManager from '@/components/products/ProductsManager';

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProductsManager />
    </div>
  );
};

export default ProductsPage;
