
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Package
} from 'lucide-react';
import ProductStats from './ProductStats';
import ProductsGrid from './ProductsGrid';
import ProductsList from './ProductsList';
import CategoriesGrid from './CategoriesGrid';
import InventoryGrid from './InventoryGrid';
import CreateProductModal from './CreateProductModal';
import CreateCategoryModal from './CreateCategoryModal';

const ProductsManager = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Fetch products with related data
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name),
          inventory(*),
          product_addons(*)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando produtos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Produtos</h1>
            <p className="text-slate-400 mt-1">Gerencie produtos, categorias e estoque</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setCreateCategoryOpen(true)}
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
            <Button
              onClick={() => setCreateProductOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <ProductStats products={products} categories={categories} />

        {/* Search and Filters */}
        <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <Button variant="outline" className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="products" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Estoque
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {viewMode === 'grid' ? (
              <ProductsGrid products={filteredProducts} />
            ) : (
              <ProductsList products={filteredProducts} />
            )}
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesGrid categories={categories} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryGrid products={products} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateProductModal 
        open={createProductOpen} 
        onOpenChange={setCreateProductOpen}
      />
      <CreateCategoryModal 
        open={createCategoryOpen} 
        onOpenChange={setCreateCategoryOpen}
      />
    </div>
  );
};

export default ProductsManager;
