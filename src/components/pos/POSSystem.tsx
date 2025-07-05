
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { POSHeader } from './components/POSHeader';
import { NewOrderView } from './components/NewOrderView';
import { OrdersView } from './components/OrdersView';
import { ClientManager } from './components/ClientManager';
import { WhatsAppManager } from './components/WhatsAppManager';
import type { Database } from '@/integrations/supabase/types';

type PaymentMethod = Database['public']['Enums']['payment_method'];

interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  addons?: SelectedAddon[];
  notes?: string;
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
  const [showClientManager, setShowClientManager] = useState(false);
  const [showWhatsAppManager, setShowWhatsAppManager] = useState(false);

  // Fetch products for POS with addons
  const { data: products } = useQuery({
    queryKey: ['pos-products', userProfile?.restaurant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name),
          product_addons(*)
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

  // Process order with addons
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

      // Create order items and addons
      for (const item of cart) {
        const { data: orderItem, error: itemsError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.total,
            notes: item.notes
          })
          .select()
          .single();

        if (itemsError) throw itemsError;

        // Create order item addons
        if (item.addons && item.addons.length > 0) {
          const addonInserts = item.addons.map(addon => ({
            order_item_id: orderItem.id,
            addon_id: addon.id,
            quantity: addon.quantity,
            unit_price: addon.price,
            total_price: addon.price * addon.quantity
          }));

          const { error: addonsError } = await supabase
            .from('order_item_addons')
            .insert(addonInserts);

          if (addonsError) throw addonsError;
        }
      }

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

  const addToCart = (product: any, addons: SelectedAddon[] = [], notes: string = '', quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        JSON.stringify(item.addons) === JSON.stringify(addons) &&
        item.notes === notes
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && 
          JSON.stringify(item.addons) === JSON.stringify(addons) &&
          item.notes === notes
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * item.price
              }
            : item
        );
      }

      return [...prevCart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
        addons,
        notes
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
    return cart.reduce((sum, item) => {
      const itemTotal = item.total;
      const addonsTotal = item.addons?.reduce((addonSum, addon) => 
        addonSum + (addon.price * addon.quantity), 0
      ) || 0;
      return sum + itemTotal + (addonsTotal * item.quantity);
    }, 0);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando sistema..." />
      </div>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <POSHeader
        userProfile={userProfile}
        activeView={activeView}
        onViewChange={setActiveView}
        totalItems={totalItems}
        totalValue={getTotal()}
        onOpenClientManager={() => setShowClientManager(true)}
        onOpenWhatsAppManager={() => setShowWhatsAppManager(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeView === 'new-order' && (
          <NewOrderView
            products={products}
            cart={cart}
            selectedTable={selectedTable}
            customerName={customerName}
            paymentMethod={paymentMethod}
            amountPaid={amountPaid}
            selectedOrder={selectedOrder}
            tables={tables}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            onTableChange={setSelectedTable}
            onCustomerNameChange={setCustomerName}
            onPaymentMethodChange={setPaymentMethod}
            onAmountPaidChange={setAmountPaid}
            onOrderSelect={setSelectedOrder}
            onProcessOrder={handleProcessOrder}
            isProcessing={processOrderMutation.isPending}
            getSubtotal={getSubtotal}
            getTotal={getTotal}
            getChange={getChange}
          />
        )}

        {(activeView === 'pending' || activeView === 'preparing') && (
          <OrdersView
            selectedOrder={selectedOrder}
            onOrderSelect={setSelectedOrder}
            filterStatus={activeView === 'pending' ? 'pending' : 'preparing'}
          />
        )}

        {activeView === 'tickets' && (
          <OrdersView
            selectedOrder={selectedOrder}
            onOrderSelect={setSelectedOrder}
            filterStatus="ready"
          />
        )}
      </div>

      {/* Modals */}
      <ClientManager
        isOpen={showClientManager}
        onClose={() => setShowClientManager(false)}
      />

      <WhatsAppManager
        isOpen={showWhatsAppManager}
        onClose={() => setShowWhatsAppManager(false)}
      />
    </div>
  );
};

export default POSSystem;
