
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Plus, Minus, User, MapPin, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from '@/components/client/LoginForm';
import { AddressForm } from '@/components/client/AddressForm';
import { PaymentForm } from '@/components/client/PaymentForm';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  addons: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: {
    name: string;
  };
  product_addons: Array<{
    id: string;
    name: string;
    price: number;
    is_active?: boolean;
  }>;
}

const DigitalMenu = () => {
  const { restaurantId } = useParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentStep, setCurrentStep] = useState<'menu' | 'login' | 'address' | 'payment' | 'confirmation'>('menu');
  const [client, setClient] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  // Buscar dados do restaurante
  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId
  });

  // Buscar produtos e categorias
  const { data: products } = useQuery({
    queryKey: ['products', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name),
          product_addons(id, name, price, is_active)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!restaurantId
  });

  // Buscar categorias
  const { data: categories } = useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId
  });

  const addToCart = (product: Product, addons: any[], notes: string = '') => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      notes,
      addons: addons.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: addon.price,
        quantity: 1
      }))
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        JSON.stringify(item.addons) === JSON.stringify(cartItem.addons) &&
        item.notes === notes
      );

      if (existingItem) {
        return prevCart.map(item =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, cartItem];
    });

    toast.success('Item adicionado ao carrinho!');
  };

  const removeFromCart = (index: number) => {
    setCart(prevCart => {
      const newCart = [...prevCart];
      if (newCart[index].quantity > 1) {
        newCart[index] = { ...newCart[index], quantity: newCart[index].quantity - 1 };
      } else {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const addonsTotal = item.addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0) * item.quantity;
      return total + itemTotal + addonsTotal;
    }, 0);
  };

  const filteredProducts = products?.filter(product =>
    selectedCategory === 'all' || product.category?.name === selectedCategory
  ) || [];

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Adicione itens ao carrinho antes de continuar');
      return;
    }
    setCurrentStep('login');
  };

  if (currentStep === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header do Restaurante */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-900">{restaurant?.name}</h1>
            <p className="text-gray-600">Cardápio Digital</p>
          </div>
        </div>

        {/* Categorias */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="whitespace-nowrap"
            >
              Todos
            </Button>
            {categories?.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.name)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Lista de Produtos */}
          <div className="grid gap-4 mb-20">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>

        {/* Carrinho Flutuante */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{cart.length} itens</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {getCartTotal().toFixed(2)}
                </p>
              </div>
              <Button onClick={proceedToCheckout} className="bg-green-600 hover:bg-green-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Finalizar Pedido
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderizar outras etapas do checkout
  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutFlow 
        step={currentStep}
        cart={cart}
        restaurant={restaurant}
        onStepChange={setCurrentStep}
        onClientChange={setClient}
        onAddressChange={setSelectedAddress}
        onPaymentChange={setSelectedPayment}
      />
    </div>
  );
};

// Componente do Card de Produto
const ProductCard = ({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product, addons: any[], notes: string) => void }) => {
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleAddonChange = (addon: any, checked: boolean) => {
    if (checked) {
      setSelectedAddons(prev => [...prev, addon]);
    } else {
      setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
    }
  };

  const getTotalPrice = () => {
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return product.price + addonsTotal;
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {product.image_url && (
          <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                R$ {product.price.toFixed(2)}
              </p>
            </div>
          </div>

          {product.product_addons && product.product_addons.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="mt-2"
            >
              Ver opções
            </Button>
          )}

          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {product.product_addons && product.product_addons.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Adicionais:</h4>
                    <div className="space-y-2">
                      {product.product_addons.filter(addon => addon.is_active !== false).map(addon => (
                        <div key={addon.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={addon.id}
                            checked={selectedAddons.some(a => a.id === addon.id)}
                            onCheckedChange={(checked) => handleAddonChange(addon, checked as boolean)}
                          />
                          <label htmlFor={addon.id} className="flex-1 text-sm">
                            {addon.name} (+R$ {addon.price.toFixed(2)})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Observações (opcional):
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: sem cebola, ponto da carne..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      Total: R$ {getTotalPrice().toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      onAddToCart(product, selectedAddons, notes);
                      setShowDetails(false);
                      setSelectedAddons([]);
                      setNotes('');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

// Componente do Fluxo de Checkout
const CheckoutFlow = ({ step, cart, restaurant, onStepChange, onClientChange, onAddressChange, onPaymentChange }: any) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Indicador de Etapas */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <StepIndicator active={step === 'login'} completed={false} number={1} label="Login" />
          <div className="w-8 h-px bg-gray-300"></div>
          <StepIndicator active={step === 'address'} completed={false} number={2} label="Endereço" />
          <div className="w-8 h-px bg-gray-300"></div>
          <StepIndicator active={step === 'payment'} completed={false} number={3} label="Pagamento" />
        </div>
      </div>

      {/* Conteúdo da Etapa */}
      {step === 'login' && (
        <LoginForm 
          onSuccess={(client) => {
            onClientChange(client);
            onStepChange('address');
          }}
          onBack={() => onStepChange('menu')}
        />
      )}

      {step === 'address' && (
        <AddressForm 
          onSuccess={(address) => {
            onAddressChange(address);
            onStepChange('payment');
          }}
          onBack={() => onStepChange('login')}
        />
      )}

      {step === 'payment' && (
        <PaymentForm 
          cart={cart}
          restaurant={restaurant}
          onSuccess={(payment) => {
            onPaymentChange(payment);
            onStepChange('confirmation');
          }}
          onBack={() => onStepChange('address')}
        />
      )}

      {step === 'confirmation' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h2>
          <p className="text-gray-600 mb-4">
            Seu pedido foi enviado para {restaurant?.name} e será preparado em breve.
          </p>
          <Button onClick={() => window.location.reload()}>
            Fazer Novo Pedido
          </Button>
        </div>
      )}
    </div>
  );
};

// Componente do Indicador de Etapa
const StepIndicator = ({ active, completed, number, label }: any) => (
  <div className="flex flex-col items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
      active ? 'bg-blue-600 text-white' : 
      completed ? 'bg-green-600 text-white' : 
      'bg-gray-300 text-gray-600'
    }`}>
      {number}
    </div>
    <span className="text-xs mt-1 text-gray-600">{label}</span>
  </div>
);

export default DigitalMenu;
