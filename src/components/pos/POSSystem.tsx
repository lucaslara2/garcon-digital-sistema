
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  CreditCard, 
  DollarSign,
  Receipt,
  Printer,
  Calculator,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

const POSSystem = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [amountPaid, setAmountPaid] = useState('');

  // Fetch products for POS
  const { data: products } = useQuery({
    queryKey: ['pos-products', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name)
        `)
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Fetch tables
  const { data: tables } = useQuery({
    queryKey: ['pos-tables', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('restaurant_id', userProfile?.restaurant_id)
        .eq('status', 'available')
        .order('table_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.restaurant_id
  });

  // Process order
  const processOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: userProfile?.restaurant_id,
          table_id: selectedTable || null,
          customer_name: customerName || 'Cliente Balcão',
          order_type: selectedTable ? 'dine_in' : 'takeout',
          subtotal: getSubtotal(),
          total: getTotal(),
          status: 'preparing'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.total
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          restaurant_id: userProfile?.restaurant_id,
          order_id: order.id,
          amount: getTotal(),
          payment_method: paymentMethod,
          status: 'completed',
          cashier_id: userProfile?.id
        });

      if (paymentError) throw paymentError;

      // Update table status if table order
      if (selectedTable) {
        await supabase
          .from('restaurant_tables')
          .update({ status: 'occupied' })
          .eq('id', selectedTable);
      }

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] });
      clearCart();
      toast.success(`Pedido #${order.id.slice(-8)} processado com sucesso!`);
    },
    onError: (error) => {
      toast.error('Erro ao processar pedido: ' + error.message);
    }
  });

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price
              }
            : item
        );
      }
      return [...prevCart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId
            ? { 
                ...item, 
                quantity: item.quantity - 1,
                total: (item.quantity - 1) * item.price
              }
            : item
        );
      }
      return prevCart.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable('');
    setCustomerName('');
    setAmountPaid('');
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotal = () => {
    return getSubtotal(); // Add taxes/fees here if needed
  };

  const getChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - getTotal());
  };

  const handleProcessOrder = () => {
    if (cart.length === 0) {
      toast.error('Adicione produtos ao carrinho');
      return;
    }

    if (paymentMethod === 'cash') {
      const paid = parseFloat(amountPaid) || 0;
      if (paid < getTotal()) {
        toast.error('Valor pago insuficiente');
        return;
      }
    }

    processOrderMutation.mutate({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sistema PDV</h1>
          <p className="text-gray-600">Ponto de Venda - Processamento de Pedidos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {products?.map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center text-center"
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-sm font-medium mb-1">{product.name}</div>
                      <div className="text-lg font-bold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </div>
                      {product.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {product.category.name}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart and Payment Section */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Mesa (opcional)</label>
                  <select 
                    className="w-full mt-1 p-2 border rounded"
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                  >
                    <option value="">Pedido Balcão</option>
                    {tables?.map((table) => (
                      <option key={table.id} value={table.id}>
                        Mesa {table.table_number} ({table.seats} lugares)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Nome do Cliente</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Carrinho</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Carrinho vazio
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            R$ {item.price.toFixed(2)} cada
                          </div>
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
                        
                        <div className="text-sm font-bold w-16 text-right">
                          R$ {item.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {getSubtotal().toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>R$ {getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Método de Pagamento</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button
                        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Dinheiro
                      </Button>
                      <Button
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('card')}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Cartão
                      </Button>
                      <Button
                        variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('pix')}
                      >
                        PIX
                      </Button>
                    </div>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div>
                      <label className="text-sm font-medium">Valor Pago</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0,00"
                      />
                      {amountPaid && (
                        <div className="mt-2 text-sm">
                          <div className="flex justify-between">
                            <span>Troco:</span>
                            <span className="font-bold">R$ {getChange().toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleProcessOrder}
                      disabled={processOrderMutation.isPending}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      {processOrderMutation.isPending ? 'Processando...' : 'Finalizar Pedido'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={clearCart}
                    >
                      Limpar Carrinho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSSystem;
