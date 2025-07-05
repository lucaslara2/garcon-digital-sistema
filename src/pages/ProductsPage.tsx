
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import ProductsManager from '@/components/products/ProductsManager';

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <ProductsManager />
    </div>
  );
};

export default ProductsPage;
