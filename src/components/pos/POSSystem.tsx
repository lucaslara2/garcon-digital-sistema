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
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingCart, Receipt, Clock, ChefHat, FileText, Plus, TrendingUp } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando sistema..." />
      </div>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Enhanced menu items with better styling
  const menuItems = [
    {
      id: 'new-order',
      label: 'Novo Pedido',
      icon: Plus,
      color: 'from-emerald-500 to-emerald-600',
      count: totalItems > 0 ? totalItems : undefined,
    },
    {
      id: 'pending',
      label: 'Pendentes',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
    },
    {
      id: 'preparing',
      label: 'Em Preparo',
      icon: ChefHat,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'tickets',
      label: 'Comandas',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Premium Header with Glass Effect */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Brand Section */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3 rounded-xl shadow-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Sistema PDV</h1>
                <p className="text-sm text-slate-400 flex items-center">
                  <span>{userProfile.name}</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                </p>
              </div>
            </div>
            
            {/* Enhanced Navigation Menu */}
            <div className="flex items-center space-x-2">
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
                      relative px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group
                      ${isActive 
                        ? 'bg-gradient-to-r text-white shadow-lg transform scale-105' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }
                    `}
                    style={isActive ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` } : {}}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    
                    {/* Badge for counts */}
                    {item.count && (
                      <Badge className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.count}
                      </Badge>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Enhanced Cart Summary */}
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 rounded-xl border border-slate-600/50 shadow-lg">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="bg-amber-500/20 p-1.5 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{totalItems}</div>
                      <div className="text-xs text-slate-400">itens</div>
                    </div>
                  </div>
                  
                  <div className="w-px h-8 bg-slate-600"></div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">R$ {getTotal().toFixed(2)}</div>
                      <div className="text-xs text-slate-400">total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeView === 'new-order' && (
          <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-140px)]">
            {/* Products Column */}
            <div className="col-span-4 animate-fade-in">
              <ProductGrid products={products} onAddToCart={addToCart} />
            </div>

            {/* Order Details and Cart Column */}
            <div className="col-span-4 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
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
                <div className="animate-slide-up">
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
                </div>
              )}
            </div>

            {/* Active Orders Column */}
            <div className="col-span-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <ActiveOrders 
                onOrderSelect={setSelectedOrder}
                selectedOrderId={selectedOrder?.id || null}
              />
            </div>
          </div>
        )}

        {(activeView === 'pending' || activeView === 'preparing') && (
          <div className="grid grid-cols-2 gap-6 min-h-[calc(100vh-140px)] animate-fade-in">
            {/* Orders List */}
            <div>
              <ActiveOrders 
                onOrderSelect={setSelectedOrder}
                selectedOrderId={selectedOrder?.id || null}
                filterStatus={activeView === 'pending' ? 'pending' : 'preparing'}
              />
            </div>

            {/* Order Ticket */}
            <div>
              <OrderTicket order={selectedOrder} />
            </div>
          </div>
        )}

        {activeView === 'tickets' && (
          <div className="grid grid-cols-2 gap-6 min-h-[calc(100vh-140px)] animate-fade-in">
            {/* Finished Orders List */}
            <div>
              <ActiveOrders 
                onOrderSelect={setSelectedOrder}
                selectedOrderId={selectedOrder?.id || null}
                filterStatus="ready"
              />
            </div>

            {/* Order Ticket */}
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
