
import React, { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Package,
  Grid3X3, 
  Tag,
  Eye,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductStats from './ProductStats';
import ProductsGrid from './ProductsGrid';
import CategoriesGrid from './CategoriesGrid';
import InventoryGrid from './InventoryGrid';
import CreateProductModal from './CreateProductModal';
import CreateCategoryModal from './CreateCategoryModal';
import CreatePromotionModal from './CreatePromotionModal';
import CreateObservationModal from './CreateObservationModal';
import PromotionsList from './PromotionsList';
import ObservationsList from './ObservationsList';

const ProductsManager = () => {
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createPromotionOpen, setCreatePromotionOpen] = useState(false);
  const [createObservationOpen, setCreateObservationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  // Usar hooks customizados
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando produtos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header Responsivo */}
      <div className="bg-white border-b border-gray-200 shadow-sm animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="animate-fade-in">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Gestão de Produtos</h1>
              <p className="text-gray-600 text-sm sm:text-base hidden sm:block">
                Gerencie produtos, categorias, estoque e promoções
              </p>
            </div>
            
            {/* Botões de Ação - Responsivo */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-3 animate-fade-in">
              <Button
                onClick={() => setCreateObservationOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                aria-label="Criar nova observação"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Nova</span> Observação
              </Button>
              <Button
                onClick={() => setCreatePromotionOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                aria-label="Criar nova promoção"
              >
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Nova</span> Promoção
              </Button>
              <Button
                onClick={() => setCreateCategoryOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                aria-label="Criar nova categoria"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Nova</span> Categoria
              </Button>
              <Button
                onClick={() => setCreateProductOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                aria-label="Criar novo produto"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Novo</span> Produto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-4 sm:p-6">
        {/* Stats com animação */}
        <div className="animate-slide-up mb-6" style={{ animationDelay: '0.1s' }}>
          <ProductStats products={products} categories={categories} />
        </div>
        
        {/* Tabs Responsivas */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-white border border-gray-200 p-1 h-auto">
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200 text-xs sm:text-sm py-2 px-2 sm:px-4"
                aria-label="Aba de produtos"
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Produtos</span>
                <span className="sm:hidden">Prod.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200 text-xs sm:text-sm py-2 px-2 sm:px-4"
                aria-label="Aba de categorias"
              >
                <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Categorias</span>
                <span className="sm:hidden">Cat.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200 text-xs sm:text-sm py-2 px-2 sm:px-4"
                aria-label="Aba de estoque"
              >
                <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Estoque</span>
                <span className="sm:hidden">Est.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="promotions" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200 text-xs sm:text-sm py-2 px-2 sm:px-4"
                aria-label="Aba de promoções"
              >
                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Promoções</span>
                <span className="sm:hidden">Prom.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="observations" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200 text-xs sm:text-sm py-2 px-2 sm:px-4 col-span-2 sm:col-span-1"
                aria-label="Aba de observações"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Observações</span>
                <span className="sm:hidden">Obs.</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6 mt-6">
              <ProductsGrid 
                selectedCategory={selectedCategory} 
                onEditProduct={(product) => console.log('Edit product:', product)} 
              />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6 mt-6">
              <CategoriesGrid onEditCategory={(category) => console.log('Edit category:', category)} />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6 mt-6">
              <InventoryGrid />
            </TabsContent>

            <TabsContent value="promotions" className="space-y-6 mt-6">
              <PromotionsList />
            </TabsContent>

            <TabsContent value="observations" className="space-y-6 mt-6">
              <ObservationsList products={products} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <CreateProductModal 
        open={createProductOpen} 
        onOpenChange={setCreateProductOpen}
        categories={categories}
      />
      <CreateCategoryModal 
        open={createCategoryOpen} 
        onOpenChange={setCreateCategoryOpen}
      />
      <CreatePromotionModal 
        open={createPromotionOpen} 
        onOpenChange={setCreatePromotionOpen}
        products={products}
      />
      <CreateObservationModal 
        open={createObservationOpen} 
        onOpenChange={setCreateObservationOpen}
      />
    </div>
  );
};

export default ProductsManager;
