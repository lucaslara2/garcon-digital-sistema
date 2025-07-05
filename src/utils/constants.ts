
// Constantes do sistema
export const APP_NAME = 'RestaurantOS';

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  MASTER: '/master',
  POS: '/pos',
  KITCHEN: '/kitchen',
  PRODUCTS: '/products',
  MANAGEMENT: '/management',
  SUBSCRIPTION: '/subscription',
  MENU: '/menu-management',
  REPORTS: '/reports',
  DIGITAL_MENU: (restaurantId: string) => `/menu/${restaurantId}`
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  RESTAURANT_OWNER: 'restaurant_owner',
  WAITER: 'waiter',
  CASHIER: 'cashier',
  KITCHEN: 'kitchen'
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;
