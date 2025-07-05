
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { usePOSLogic } from '@/components/pos/hooks/usePOSLogic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      update: vi.fn(() => Promise.resolve({ data: {}, error: null }))
    }))
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock AuthProvider
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    userProfile: {
      id: 'test-user',
      restaurant_id: 'test-restaurant'
    }
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePOSLogic Hook', () => {
  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => usePOSLogic(), {
      wrapper: createWrapper(),
    });

    expect(result.current.cart).toEqual([]);
    expect(result.current.getTotal()).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => usePOSLogic(), {
      wrapper: createWrapper(),
    });

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 10.00,
      description: 'Test Description',
      image_url: null,
      is_active: true,
      category_id: null,
      restaurant_id: 'test-restaurant',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].name).toBe('Test Product');
    expect(result.current.getTotal()).toBe(10.00);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => usePOSLogic(), {
      wrapper: createWrapper(),
    });

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 10.00,
      description: 'Test Description',
      image_url: null,
      is_active: true,
      category_id: null,
      restaurant_id: 'test-restaurant',
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.removeFromCart('1');
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getTotal()).toBe(0);
  });
});
