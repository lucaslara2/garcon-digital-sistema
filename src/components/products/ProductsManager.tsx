
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  ImageIcon
} from 'lucide-react';
import ProductStats from './ProductStats';
import CreateProductModal from './CreateProductModal';
import CreateCategoryModal from './CreateCategoryModal';

const ProductsManager = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando produtos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header similar to POS */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Produtos</h1>
              <p className="text-gray-600">Gerencie produtos, categorias e estoque</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setCreateCategoryOpen(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
              <Button
                onClick={() => setCreateProductOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-4">
        {/* Stats */}
        <ProductStats products={products} categories={categories} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Products Grid - Similar to POS ProductGrid */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="bg-blue-600 p-2 rounded-lg mr-3">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    Produtos
                  </h2>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                    {filteredProducts?.length || 0} itens
                  </Badge>
                </div>
                
                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm bg-white border-gray-300"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Package className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-gray-900">Nenhum produto encontrado</h3>
                    <p className="text-sm text-center max-w-xs">
                      Comece criando seu primeiro produto!
                    </p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors ${
                          viewMode === 'list' ? 'flex items-center space-x-4' : 'flex flex-col'
                        }`}
                      >
                        {/* Product Image */}
                        <div className={`flex-shrink-0 ${viewMode === 'list' ? 'w-16 h-16' : 'w-full h-32 mb-3'}`}>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                              {product.description && (
                                <p className="text-gray-500 text-sm truncate mt-1">
                                  {product.description}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-2 mt-2">
                                {product.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {product.category.name}
                                  </Badge>
                                )}
                                <Badge 
                                  className={product.is_active ? 'bg-green-600' : 'bg-red-600'} 
                                  variant="secondary"
                                >
                                  {product.is_active ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                            </div>

                            <div className="text-right ml-2">
                              <div className="flex items-center text-green-600 font-bold">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {product.price.toFixed(2)}
                              </div>
                              <div className="flex items-center text-gray-500 text-sm mt-1">
                                <Package className="h-3 w-3 mr-1" />
                                {product.inventory?.[0]?.current_stock || 0}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories Panel - Similar to POS Cart */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="bg-green-600 p-2 rounded-lg mr-3">
                    <Grid3X3 className="h-4 w-4 text-white" />
                  </div>
                  Categorias
                </h2>
              </div>

              {categories.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
                  <Grid3X3 className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-gray-600">Nenhuma categoria</h3>
                  <p className="text-sm text-center max-w-xs">
                    Crie categorias para organizar seus produtos
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div 
                        key={category.id} 
                        className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            {category.description && (
                              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                            )}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${selectedCategory === category.id ? 'bg-blue-100 text-blue-800' : ''}`}
                          >
                            {products.filter(p => p.category_id === category.id).length}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default ProductsManager;
