
import { renderHook, act } from '@testing-library/react';
import { usePOSLogic } from '@/components/pos/hooks/usePOSLogic';
import { describe, it, expect, vi } from 'vitest';

// Mock do useAuth
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    userProfile: {
      id: 'user1',
      restaurant_id: 'restaurant1'
    }
  })
}));

// Mock do QueryClient
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn()
  }),
  useMutation: ({ mutationFn, onSuccess, onError }: any) => ({
    mutate: vi.fn(() => {
      try {
        const result = mutationFn();
        onSuccess(result);
      } catch (error) {
        onError(error);
      }
    }),
    isPending: false
  })
}));

const mockProduct = {
  id: 'product1',
  name: 'Pizza Margherita',
  price: 25.90
};

describe('usePOSLogic Hook', () => {
  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => usePOSLogic());
    
    expect(result.current.cart).toEqual([]);
    expect(result.current.selectedTable).toBe('balcao');
    expect(result.current.customerName).toBe('');
  });

  it('should add product to cart', () => {
    const { result } = renderHook(() => usePOSLogic());
    
    act(() => {
      result.current.addToCart(mockProduct, [], '', 1);
    });
    
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].name).toBe('Pizza Margherita');
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('should calculate subtotal correctly', () => {
    const { result } = renderHook(() => usePOSLogic());
    
    act(() => {
      result.current.addToCart(mockProduct, [], '', 2);
    });
    
    expect(result.current.getSubtotal()).toBe(51.80);
  });

  it('should remove product from cart', () => {
    const { result } = renderHook(() => usePOSLogic());
    
    act(() => {
      result.current.addToCart(mockProduct, [], '', 2);
    });
    
    act(() => {
      result.current.removeFromCart('product1');
    });
    
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => usePOSLogic());
    
    act(() => {
      result.current.addToCart(mockProduct, [], '', 1);
    });
    
    act(() => {
      result.current.clearCart();
    });
    
    expect(result.current.cart).toEqual([]);
    expect(result.current.selectedTable).toBe('balcao');
    expect(result.current.customerName).toBe('');
  });
});
