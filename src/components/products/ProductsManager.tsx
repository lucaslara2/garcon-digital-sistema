
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Tag, TrendingUp, BarChart3 } from 'lucide-react';
import ProductStats from './ProductStats';
import ProductsGrid from './ProductsGrid';
import CategoriesGrid from './CategoriesGrid';
import InventoryGrid from './InventoryGrid';
import CreateProductModal from './CreateProductModal';
import CreateCategoryModal from './CreateCategoryModal';
import CreateObservationModal from './CreateObservationModal';
import CreatePromotionModal from './CreatePromotionModal';
import ObservationsList from './ObservationsList';
import PromotionsList from './PromotionsList';
import RestaurantSelector from '@/components/admin/RestaurantSelector';

const ProductsManager = () => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [observationModalOpen, setObservationModalOpen] = useState(false);
  const [promotionModalOpen, setPromotionModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const isAdmin = userProfile?.role === 'admin';
  const effectiveRestaurantId = isAdmin ? selectedRestaurantId : userProfile?.restaurant_id;

  // Fetch categories and products with the effective restaurant ID
  const { data: categories = [] } = useCategories(effectiveRestaurantId);
  const { data: products = [] } = useProducts(selectedCategory, effectiveRestaurantId);

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  if (!userProfile) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
          <p className="text-gray-600">Gerencie produtos, categorias, estoque e promoções</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-4">
            <RestaurantSelector
              selectedRestaurantId={selectedRestaurantId}
              onRestaurantChange={setSelectedRestaurantId}
              placeholder="Selecione um restaurante para gerenciar"
            />
          </div>
        )}
      </div>

      {(!isAdmin || effectiveRestaurantId) && (
        <>
          <ProductStats products={products} categories={categories} />

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Estoque</span>
              </TabsTrigger>
              <TabsTrigger value="observations" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Observações</span>
              </TabsTrigger>
              <TabsTrigger value="promotions" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Promoções</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {/* Category filter will be here */}
                </div>
                <Button onClick={() => setProductModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
              <ProductsGrid 
                selectedCategory={selectedCategory} 
                onEditProduct={handleEditProduct}
              />
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setCategoryModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>
              <CategoriesGrid />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <InventoryGrid />
            </TabsContent>

            <TabsContent value="observations" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setObservationModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Observação
                </Button>
              </div>
              <ObservationsList />
            </TabsContent>

            <TabsContent value="promotions" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setPromotionModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Promoção
                </Button>
              </div>
              <PromotionsList />
            </TabsContent>
          </Tabs>
        </>
      )}

      {isAdmin && !effectiveRestaurantId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Selecione um Restaurante</span>
            </CardTitle>
            <CardDescription>
              Para gerenciar produtos, selecione um restaurante na lista acima.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Como administrador, você pode gerenciar produtos de qualquer restaurante ativo.
              Selecione um restaurante para começar.
            </p>
          </CardContent>
        </Card>
      )}

      <CreateProductModal
        open={productModalOpen}
        onOpenChange={handleCloseProductModal}
        editingProduct={editingProduct}
        categories={categories}
      />

      <CreateCategoryModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
      />

      <CreateObservationModal
        open={observationModalOpen}
        onOpenChange={setObservationModalOpen}
      />

      <CreatePromotionModal
        open={promotionModalOpen}
        onOpenChange={setPromotionModalOpen}
        products={products}
      />
    </div>
  );
};

export default ProductsManager;
