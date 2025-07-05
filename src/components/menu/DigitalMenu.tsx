
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  MapPin, 
  User,
  Phone,
  Mail
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

const DigitalMenu = ({ restaurantId }: { restaurantId: string }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const { data: restaurant } = useQuery({
    queryKey: ['public-restaurant', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['public-categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          products(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data;
    }
  });

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    });
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter(item => item.id !== productId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Finalizar Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Resumo do Pedido</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-medium">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>R$ {getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">Nome Completo</Label>
                  <Input id="customer-name" placeholder="Seu nome completo" />
                </div>
                
                <div>
                  <Label htmlFor="customer-phone">Telefone</Label>
                  <Input id="customer-phone" placeholder="(11) 99999-9999" />
                </div>
                
                <div>
                  <Label htmlFor="customer-email">E-mail (opcional)</Label>
                  <Input id="customer-email" type="email" placeholder="seu@email.com" />
                </div>
                
                <div>
                  <Label htmlFor="delivery-address">Endereço de Entrega</Label>
                  <Textarea id="delivery-address" placeholder="Rua, número, bairro, cidade" />
                </div>

                <div>
                  <Label htmlFor="order-notes">Observações (opcional)</Label>
                  <Textarea id="order-notes" placeholder="Observações especiais para o pedido" />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
                  Finalizar Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{restaurant?.name}</h1>
              <p className="text-slate-600">Cardápio Digital</p>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-amber-600 hover:bg-amber-700"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrinho
              {getCartItemCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {getCartItemCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-6">
            {categories?.map((category) => (
              <div key={category.id}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">{category.name}</h2>
                <div className="grid gap-4">
                  {category.products?.map((product: any) => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900">{product.name}</h3>
                            {product.description && (
                              <p className="text-slate-600 text-sm mt-1">{product.description}</p>
                            )}
                            <p className="text-lg font-bold text-amber-600 mt-2">
                              R$ {product.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="ml-4 flex flex-col items-end space-y-2">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Seu Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-slate-600 text-center py-4">
                      Carrinho vazio
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-slate-600 text-sm">
                              R$ {item.price.toFixed(2)} cada
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart({ ...item, id: item.id })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total:</span>
                          <span>R$ {getCartTotal().toFixed(2)}</span>
                        </div>
                        <Button
                          className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                          onClick={() => setShowCheckout(true)}
                        >
                          Finalizar Pedido
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalMenu;
