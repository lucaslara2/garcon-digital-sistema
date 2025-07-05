
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductModal } from './components/ProductModal';

interface ProductAddon {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category?: {
    name: string;
  };
  product_addons?: ProductAddon[];
}

interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ProductGridProps {
  products: Product[] | undefined;
  onAddToCart: (product: Product, addons?: SelectedAddon[], notes?: string, quantity?: number) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (product: Product) => {
    // Se o produto tem adicionais, abrir modal; senão, adicionar direto
    if (product.product_addons && product.product_addons.length > 0) {
      setSelectedProduct(product);
      setShowProductModal(true);
    } else {
      onAddToCart(product, [], '', 1);
    }
  };

  const handleAddToCartFromModal = (product: Product, addons: SelectedAddon[], notes: string, quantity: number) => {
    onAddToCart(product, addons, notes, quantity);
  };

  if (!products?.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 h-full shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
              <Package className="h-4 w-4 text-white" />
            </div>
            Produtos
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Package className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-gray-900">Nenhum produto disponível</h3>
          <p className="text-sm text-center max-w-xs">
            Configure produtos no painel de gerenciamento para começar a vender
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col shadow-sm">
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
          
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm bg-white border-gray-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts?.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="h-auto p-3 flex flex-col border border-gray-200 bg-white hover:bg-gray-50 text-left group transition-all duration-200 rounded-lg hover:border-blue-300"
                onClick={() => handleProductClick(product)}
              >
                <div className="w-full space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 transition-colors">
                        {product.name}
                      </div>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs mt-1 bg-gray-100 text-gray-600 border-gray-200">
                          {product.category.name}
                        </Badge>
                      )}
                      {product.product_addons && product.product_addons.length > 0 && (
                        <Badge variant="outline" className="text-xs mt-1 border-orange-300 text-orange-600">
                          + Adicionais
                        </Badge>
                      )}
                    </div>
                    <div className="bg-green-100 p-1.5 rounded-lg group-hover:bg-green-200 transition-colors ml-2">
                      <Plus className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal do produto */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCartFromModal}
      />
    </>
  );
}
