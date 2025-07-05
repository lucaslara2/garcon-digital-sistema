
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Grid3X3,
  List,
  Star
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductsGrid from './ProductsGrid';
import ProductsList from './ProductsList';
import CategoriesGrid from './CategoriesGrid';
import InventoryGrid from './InventoryGrid';
import ProductStats from './ProductStats';
import CreateProductModal from './CreateProductModal';
import CreateCategoryModal from './CreateCategoryModal';

const ProductsManager = () => {
  const { userProfile } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [productModal, setProductModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);

  // Fetch products with categories and inventory
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', userProfile?.restaurant_id, selectedCategory, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name, display_order),
          inventory(current_stock, min_stock, max_stock),
          product_addons(id, name, price)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('is_active', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestão de Produtos</h1>
            <p className="text-slate-400">Gerencie seu cardápio, categorias e estoque</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setCategoryModal(true)}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
            <Button
              onClick={() => setProductModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ProductStats 
          products={products || []} 
          categories={categories || []} 
        />

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="products" className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-slate-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estoque
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div>
                    <CardTitle className="text-white">Produtos do Cardápio</CardTitle>
                    <CardDescription className="text-slate-400">
                      Gerencie todos os produtos do seu restaurante
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
                      <Button
                        size="sm"
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[200px]"
                  >
                    <option value="">Todas as categorias</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Products Content */}
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-slate-400">Carregando produtos...</div>
                  </div>
                ) : viewMode === 'grid' ? (
                  <ProductsGrid products={products || []} />
                ) : (
                  <ProductsList products={products || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesGrid categories={categories || []} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryGrid products={products || []} />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateProductModal 
          open={productModal}
          onOpenChange={setProductModal}
          categories={categories || []}
        />
        
        <CreateCategoryModal 
          open={categoryModal}
          onOpenChange={setCategoryModal}
        />
      </div>
    </div>
  );
};

export default ProductsManager;
