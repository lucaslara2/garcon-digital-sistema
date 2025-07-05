
import React, { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Package,
  Edit,
  Trash2,
  DollarSign,
  ImageIcon,
  Tag,
  Eye,
  TrendingUp,
  Percent
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
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createPromotionOpen, setCreatePromotionOpen] = useState(false);
  const [createObservationOpen, setCreateObservationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  // Usar hooks customizados
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateProfitInfo = (product: any) => {
    const cost = product.cost_price || 0;
    const price = product.price || 0;
    const profit = price - cost;
    const margin = price > 0 ? ((profit / price) * 100) : 0;
    return { profit, margin, cost, price };
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando produtos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header with enhanced animations */}
      <div className="bg-white border-b border-gray-200 shadow-sm animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Produtos</h1>
              <p className="text-gray-600">Gerencie produtos, categorias, estoque e promoções</p>
            </div>
            
            <div className="flex items-center space-x-3 animate-fade-in">
              <Button
                onClick={() => setCreateObservationOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Nova Observação
              </Button>
              <Button
                onClick={() => setCreatePromotionOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
              >
                <Tag className="h-4 w-4 mr-2" />
                Nova Promoção
              </Button>
              <Button
                onClick={() => setCreateCategoryOpen(true)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
              <Button
                onClick={() => setCreateProductOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6">
        {/* Stats with staggered animation */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <ProductStats products={products} categories={categories} />
        </div>
        
        <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 p-1">
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <Package className="h-4 w-4 mr-2" />
                Produtos
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Categorias
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <Package className="h-4 w-4 mr-2" />
                Estoque
              </TabsTrigger>
              <TabsTrigger 
                value="promotions" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <Tag className="h-4 w-4 mr-2" />
                Promoções
              </TabsTrigger>
              <TabsTrigger 
                value="observations" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-2" />
                Observações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-6">
              <ProductsGrid 
                selectedCategory={selectedCategory} 
                onEditProduct={(product) => console.log('Edit product:', product)} 
              />
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <CategoriesGrid onEditCategory={(category) => console.log('Edit category:', category)} />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <InventoryGrid />
            </TabsContent>

            <TabsContent value="promotions" className="space-y-6">
              <PromotionsList />
            </TabsContent>

            <TabsContent value="observations" className="space-y-6">
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
