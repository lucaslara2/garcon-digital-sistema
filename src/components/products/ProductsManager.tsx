
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import ProductStats from './ProductStats';
import CreateProductModal from './CreateProductModal';
import CreateCategoryModal from './CreateCategoryModal';
import CreatePromotionModal from './CreatePromotionModal';
import CreateObservationModal from './CreateObservationModal';
import PromotionsList from './PromotionsList';
import ObservationsList from './ObservationsList';

const ProductsManager = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createPromotionOpen, setCreatePromotionOpen] = useState(false);
  const [createObservationOpen, setCreateObservationOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
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
          product_addons(*),
          product_observation_assignments(
            observation_id,
            product_observations(name)
          )
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
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1">
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
              {/* Products Management */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-6 border-b border-gray-200 bg-white rounded-t-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <div className="bg-blue-600 p-3 rounded-xl mr-3 shadow-sm">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      Produtos
                    </h2>
                    <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
                      {filteredProducts?.length || 0} itens
                    </Badge>
                  </div>
                  
                  {/* Enhanced Search and Filters */}
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-10 text-sm bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={`transition-all duration-200 ${viewMode === 'grid' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                          : 'bg-transparent border-0 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={`transition-all duration-200 ${viewMode === 'list' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                          : 'bg-transparent border-0 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-fade-in">
                      <Package className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2 text-gray-700">Nenhum produto encontrado</h3>
                      <p className="text-sm text-center max-w-xs">
                        Comece criando seu primeiro produto!
                      </p>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                      {filteredProducts.map((product, index) => {
                        const profitInfo = calculateProfitInfo(product);
                        return (
                          <div
                            key={product.id}
                            className={`bg-white border border-gray-200 rounded-xl p-6 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 animate-fade-in ${
                              viewMode === 'list' ? 'flex items-center space-x-6' : 'flex flex-col'
                            }`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            {/* Product Image */}
                            <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48 mb-4'}`}>
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
                                  <ImageIcon className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 text-xl mb-2">{product.name}</h3>
                                  {product.description && (
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                      {product.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center space-x-2 mb-4">
                                    {product.category && (
                                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                        {product.category.name}
                                      </Badge>
                                    )}
                                    <Badge 
                                      className={`text-xs ${product.is_active 
                                        ? 'bg-green-50 text-green-700 border border-green-200' 
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                      }`} 
                                      variant="secondary"
                                    >
                                      {product.is_active ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                    
                                    {/* Observações */}
                                    {product.product_observation_assignments?.length > 0 && (
                                      <Badge variant="secondary" className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
                                        {product.product_observation_assignments.length} obs.
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Price and Profit Info */}
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Preço de Custo</p>
                                  <div className="flex items-center text-red-600 font-bold">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {profitInfo.cost.toFixed(2)}
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Preço de Venda</p>
                                  <div className="flex items-center text-green-600 font-bold">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {profitInfo.price.toFixed(2)}
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Lucro Bruto</p>
                                  <div className="flex items-center text-blue-600 font-bold">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    R$ {profitInfo.profit.toFixed(2)}
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-500 mb-1">Margem de Lucro</p>
                                  <div className="flex items-center text-purple-600 font-bold">
                                    <Percent className="h-4 w-4 mr-1" />
                                    {profitInfo.margin.toFixed(1)}%
                                  </div>
                                </div>
                              </div>

                              {/* Stock Info */}
                              <div className="flex items-center text-gray-500 text-sm mb-4">
                                <Package className="h-4 w-4 mr-1" />
                                Estoque: {product.inventory?.[0]?.current_stock || 0}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-sm bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              {/* Categories Panel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="p-6 border-b border-gray-200 bg-white rounded-t-xl">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <div className="bg-green-600 p-3 rounded-xl mr-3 shadow-sm">
                      <Grid3X3 className="h-5 w-5 text-white" />
                    </div>
                    Categorias
                  </h2>
                </div>

                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-fade-in">
                    <Grid3X3 className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2 text-gray-700">Nenhuma categoria</h3>
                    <p className="text-sm text-center max-w-xs">
                      Crie categorias para organizar seus produtos
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category, index) => (
                        <div 
                          key={category.id} 
                          className="bg-white p-6 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 animate-fade-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-lg mb-2">{category.name}</h4>
                              {category.description && (
                                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                              )}
                              <p className="text-xs text-gray-500">Ordem: {category.display_order}</p>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="text-sm bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1"
                            >
                              {products.filter(p => p.category_id === category.id).length}
                            </Badge>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-sm bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white border-gray-300 hover:shadow-sm transform hover:scale-105 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
