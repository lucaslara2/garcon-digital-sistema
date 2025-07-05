
import React from 'react';
import { ProductGrid } from '../ProductGrid';
import { OrderDetails } from '../OrderDetails';
import { Cart } from '../Cart';
import { PaymentSection } from '../PaymentSection';
import { OrderTicket } from '../OrderTicket';
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

interface NewOrderViewProps {
  products: any[];
  cart: CartItem[];
  selectedTable: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  amountPaid: string;
  selectedOrder: any;
  tables: any[];
  onAddToCart: (product: any, addons?: SelectedAddon[], notes?: string, quantity?: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onTableChange: (table: string) => void;
  onCustomerNameChange: (name: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAmountPaidChange: (amount: string) => void;
  onOrderSelect: (order: any) => void;
  onProcessOrder: () => void;
  isProcessing: boolean;
  getSubtotal: () => number;
  getTotal: () => number;
  getChange: () => number;
}

export function NewOrderView({
  products,
  cart,
  selectedTable,
  customerName,
  paymentMethod,
  amountPaid,
  selectedOrder,
  tables,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onTableChange,
  onCustomerNameChange,
  onPaymentMethodChange,
  onAmountPaidChange,
  onOrderSelect,
  onProcessOrder,
  isProcessing,
  getSubtotal,
  getTotal,
  getChange
}: NewOrderViewProps) {
  return (
    <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-140px)]">
      {/* Produtos - Coluna da Esquerda */}
      <div className="col-span-3 animate-fade-in">
        <ProductGrid products={products} onAddToCart={onAddToCart} />
      </div>

      {/* Detalhes do Pedido e Carrinho - Coluna Central */}
      <div className="col-span-4 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <OrderDetails
          selectedTable={selectedTable}
          setSelectedTable={onTableChange}
          customerName={customerName}
          setCustomerName={onCustomerNameChange}
          tables={tables}
        />

        <div className="flex-1">
          <Cart
            cart={cart}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
            onClearCart={onClearCart}
          />
        </div>

        {cart.length > 0 && (
          <div className="animate-slide-up">
            <PaymentSection
              subtotal={getSubtotal()}
              total={getTotal()}
              paymentMethod={paymentMethod}
              setPaymentMethod={onPaymentMethodChange}
              amountPaid={amountPaid}
              setAmountPaid={onAmountPaidChange}
              change={getChange()}
              onProcessOrder={onProcessOrder}
              isProcessing={isProcessing}
            />
          </div>
        )}
      </div>

      {/* Comanda do Pedido - Coluna da Direita */}
      <div className="col-span-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <OrderTicket order={selectedOrder} />
      </div>
    </div>
  );
}
