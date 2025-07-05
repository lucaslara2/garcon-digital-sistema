
export interface Table {
  id: string;
  table_number: number;
  seats: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  addresses: {
    id: string;
    address: string;
    label: string;
    is_default: boolean;
  }[];
}

export interface OrderDetailsProps {
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tables: Table[] | undefined;
}

export type OrderType = 'balcao' | 'entrega' | 'retirada' | 'mesa';
