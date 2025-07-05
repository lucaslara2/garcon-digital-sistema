
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';
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

export function usePOSLogic() {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('balcao');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');

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

  const getTotal = () => getSubtotal();
  const getChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - getTotal());
  };

  const processOrderMutation = useMutation({
    mutationFn: async () => {
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
    onError: (error: any) => {
      toast.error('Erro ao processar pedido: ' + error.message);
    }
  });

  return {
    cart,
    selectedTable,
    customerName,
    paymentMethod,
    amountPaid,
    setSelectedTable,
    setCustomerName,
    setPaymentMethod,
    setAmountPaid,
    addToCart,
    removeFromCart,
    clearCart,
    getSubtotal,
    getTotal,
    getChange,
    processOrder: () => processOrderMutation.mutate(),
    isProcessing: processOrderMutation.isPending
  };
}
