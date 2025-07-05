import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProductGrid } from './ProductGrid';
import { OrderDetails } from './OrderDetails';
import { Cart } from './Cart';
import { PaymentSection } from './PaymentSection';
import { ActiveOrders } from './ActiveOrders';
import { OrderTicket } from './OrderTicket';
import { Button } from '@/components/ui/button';
import { Store, ShoppingCart, Receipt, Clock, ChefHat, FileText, Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];

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
  const [selectedTable, setSelectedTable] = useState<string>('balcao');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeView, setActiveView] = useState<'new-order' | 'pending' | 'preparing' | 'tickets'>('new-order');

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
          table_id: selectedTable && selectedTable !== 'balcao' ? selectedTable : null,
          customer_name: customerName || 'Cliente Balcão',
          order_type: selectedTable && selectedTable !== 'balcao' ? 'dine_in' : 'takeout',
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
          restaurant_id: userProfile?.restaurant_id!,
          order_id: order.id,
          amount: getTotal(),
          payment_method: paymentMethod,
          status: 'completed',
          cashier_id: userProfile?.id
        });

      if (paymentError) throw paymentError;

      // Update table status if table order
      if (selectedTable && selectedTable !== 'balcao') {
        await supabase
          .from('restaurant_tables')
          .update({ status: 'occupied' })
          .eq('id', selectedTable);
      }

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] });
      queryClient.invalidateQueries({ queryKey: ['active-orders'] });
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
    setSelectedTable('balcao');
    setCustomerName('');
    setAmountPaid('');
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotal = () => {
    return getSubtotal();
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando sistema..." />
      </div>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Menu items configuration - simplified without colors
  const menuItems = [
    {
      id: 'new-order',
      label: 'Novo Pedido',
      icon: Plus,
    },
    {
      id: 'pending',
      label: 'Pendentes',
      icon: Clock,
    },
    {
      id: 'preparing',
      label: 'Em Preparo',
      icon: ChefHat,
    },
    {
      id: 'tickets',
      label: 'Comandas',
      icon: FileText,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Refined Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand Section */}
            <div className="flex items-center space-x-3">
              <div className="bg-slate-800 p-2.5 rounded-lg">
                <Store className="h-5 w-5 text-slate-300" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Sistema PDV</h1>
                <p className="text-sm text-slate-400">{userProfile.name}</p>
              </div>
            </div>
            
            {/* Navigation Menu - Clean Design */}
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const isActive = activeView === item.id;
                const Icon = item.icon;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView(item.id as any)}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                      ${isActive 
                        ? 'bg-slate-800 text-white border border-slate-700' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Cart Summary - Minimalist */}
            <div className="flex items-center space-x-4">
              <div className="bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <ShoppingCart className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{totalItems}</span>
                  </div>
                  
                  <div className="w-px h-4 bg-slate-600"></div>
                  
                  <div className="flex items-center space-x-1">
                    <Receipt className="h-4 w-4 text-slate-400" />
                    <span className="text-white font-medium">R$ {getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeView === 'new-order' && (
          <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-100px)]">
            {/* Produtos */}
            <div className="col-span-4">
              <ProductGrid products={products} onAddToCart={addToCart} />
            </div>

            {/* Detalhes do Pedido e Carrinho */}
            <div className="col-span-4 space-y-4">
              <OrderDetails
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                customerName={customerName}
                setCustomerName={setCustomerName}
                tables={tables}
              />

              <div className="flex-1">
                <Cart
                  cart={cart}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                  onClearCart={clearCart}
                />
              </div>

              {cart.length > 0 && (
                <PaymentSection
                  subtotal={getSubtotal()}
                  total={getTotal()}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  amountPaid={amountPaid}
                  setAmountPaid={setAmountPaid}
                  change={getChange()}
                  onProcessOrder={handleProcessOrder}
                  isProcessing={processOrderMutation.isPending}
                />
              )}
            </div>

            {/* Pedidos Ativos */}
            <div className="col-span-4">
              <ActiveOrders 
                onOrderSelect={setSelectedOrder}
                selectedOrderId={selectedOrder?.id || null}
              />
            </div>
          </div>
        )}

        {(activeView === 'pending' || activeView === 'preparing') && (
          <div className="grid grid-cols-2 gap-4 min-h-[calc(100vh-100px)]">
            {/* Lista de Pedidos */}
            <div>
              <ActiveOrders 
                onOrderSelect={setSelectedOrder}
                selectedOrderId={selectedOrder?.id || null}
                filterStatus={activeView === 'pending' ? 'pending' : 'preparing'}
              />
            </div>

            {/* Comanda do Pedido Selecionado */}
            <div>
              <OrderTicket order={selectedOrder} />
            </div>
          </div>
        )}

        {activeView === 'tickets' && (
          <div className="grid grid-cols-2 gap-4 min-h-[calc(100vh-100px)]">
            {/* Lista de Pedidos Finalizados */}
            <div>
              <ActiveOrders 
                onOrderSelect={setSelectedOrder}
                selectedOrderId={selectedOrder?.id || null}
                filterStatus="ready"
              />
            </div>

            {/* Comanda do Pedido Selecionado */}
            <div>
              <OrderTicket order={selectedOrder} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSystem;
