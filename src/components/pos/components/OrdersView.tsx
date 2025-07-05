
import React from 'react';
import { ActiveOrders } from '../ActiveOrders';
import { OrderTicket } from '../OrderTicket';

interface OrdersViewProps {
  selectedOrder: any;
  onOrderSelect: (order: any) => void;
  filterStatus?: 'pending' | 'preparing' | 'ready';
}

export function OrdersView({ selectedOrder, onOrderSelect, filterStatus }: OrdersViewProps) {
  return (
    <div className="grid grid-cols-2 gap-6 min-h-[calc(100vh-140px)] animate-fade-in">
      {/* Orders List */}
      <div>
        <ActiveOrders 
          onOrderSelect={onOrderSelect}
          selectedOrderId={selectedOrder?.id || null}
          filterStatus={filterStatus}
        />
      </div>

      {/* Order Ticket */}
      <div>
        <OrderTicket order={selectedOrder} />
      </div>
    </div>
  );
}
