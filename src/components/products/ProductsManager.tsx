
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  Edit,
  Trash2,
  ImageIcon
} from 'lucide-react';
import CreateProductModal from './CreateProductModal';
import CreateCategoryModal from './CreateCategoryModal';

const ProductsManager = () => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<any[]>([]);

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalValue = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando produtos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Sistema POS</h1>
            <span className="text-sm text-gray-500">ceo@lucas.com</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
            <Button variant="outline" className="border-gray-300">
              Pedidos
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </Button>
            <Button variant="outline" className="border-gray-300">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Column - Products */}
        <div className="w-1/3 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Produtos</h2>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory('all')}
              >
                Todas as Categorias
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Products List */}
          <div className="p-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto disponível</h3>
                <p className="text-gray-500 mb-4">Configure produtos no painel de gerenciamento para começar a vender</p>
                <Button
                  onClick={() => setCreateProductOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">R$ {product.price.toFixed(2)}</p>
                          {product.category && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>

                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit logic here
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Delete logic here
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Column - Order Details */}
        <div className="w-1/3 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Detalhes do Pedido</h2>
            </div>
            <p className="text-sm text-gray-500">Configure os dados do pedido</p>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pedido
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Pedido Balcão</option>
                  <option>Delivery</option>
                  <option>Mesa</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Consumo no local (balcão)</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900">Carrinho</h3>
                  <span className="text-sm text-gray-500">{getTotalItems()} itens</span>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Carrinho vazio</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-green-100 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">R$ {item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Command */}
        <div className="w-1/3 bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Itens no Carrinho</h2>
                <p className="text-2xl font-bold text-gray-900">{getTotalItems()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {getTotalValue().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-base">Comanda do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">Selecione um pedido</p>
                    <p className="text-sm text-gray-400">Clique em um produto para ver a comanda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <span className="text-sm text-gray-500">Qtd: {item.quantity}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.description || 'Produto selecionado'}</p>
                        <p className="text-sm font-medium text-gray-900">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-lg text-gray-900">R$ {getTotalValue().toFixed(2)}</span>
                      </div>
                      
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={cart.length === 0}
                      >
                        Finalizar Pedido
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
