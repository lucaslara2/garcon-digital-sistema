
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { POSHeader } from './components/POSHeader';
import { NewOrderView } from './components/NewOrderView';
import { OrdersView } from './components/OrdersView';
import { ClientManager } from './components/ClientManager';
import { WhatsAppManager } from './components/WhatsAppManager';
import { POSStats } from './components/POSStats';
import { usePOSLogic } from './hooks/usePOSLogic';
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';

const POSSystem = () => {
  const { userProfile } = useAuth();
  const { trackPageView, trackUserAction } = useAnalytics();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeView, setActiveView] = useState<'new-order' | 'orders'>('new-order');
  const [showClientManager, setShowClientManager] = useState(false);
  const [showWhatsAppManager, setShowWhatsAppManager] = useState(false);

  const posLogic = usePOSLogic();

  React.useEffect(() => {
    trackPageView('pos_system');
  }, [trackPageView]);

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

  const handleProcessOrder = () => {
    trackUserAction('process_order', {
      total_items: posLogic.cart.length,
      total_value: posLogic.getTotal(),
      payment_method: posLogic.paymentMethod
    });
    posLogic.processOrder();
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando sistema..." />
      </div>
    );
  }

  const totalItems = posLogic.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <POSHeader
        userProfile={userProfile}
        activeView={activeView}
        onViewChange={setActiveView}
        totalItems={totalItems}
        totalValue={posLogic.getTotal()}
        onOpenClientManager={() => setShowClientManager(true)}
        onOpenWhatsAppManager={() => setShowWhatsAppManager(true)}
      />

      <div className="max-w-full mx-auto p-4">
        <POSStats totalItems={totalItems} totalValue={posLogic.getTotal()} />
        
        {activeView === 'new-order' && (
          <NewOrderView
            products={products}
            cart={posLogic.cart}
            selectedTable={posLogic.selectedTable}
            customerName={posLogic.customerName}
            paymentMethod={posLogic.paymentMethod}
            amountPaid={posLogic.amountPaid}
            selectedOrder={selectedOrder}
            tables={tables}
            onAddToCart={posLogic.addToCart}
            onRemoveFromCart={posLogic.removeFromCart}
            onClearCart={posLogic.clearCart}
            onTableChange={posLogic.setSelectedTable}
            onCustomerNameChange={posLogic.setCustomerName}
            onPaymentMethodChange={posLogic.setPaymentMethod}
            onAmountPaidChange={posLogic.setAmountPaid}
            onOrderSelect={setSelectedOrder}
            onProcessOrder={handleProcessOrder}
            isProcessing={posLogic.isProcessing}
            getSubtotal={posLogic.getSubtotal}
            getTotal={posLogic.getTotal}
            getChange={posLogic.getChange}
          />
        )}

        {activeView === 'orders' && (
          <OrdersView
            selectedOrder={selectedOrder}
            onOrderSelect={setSelectedOrder}
          />
        )}
      </div>

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
