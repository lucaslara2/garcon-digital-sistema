
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Cart } from '@/components/pos/Cart';

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Cart Component', () => {
  const mockCartItems = [
    {
      id: '1',
      product: {
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
      },
      quantity: 2,
      notes: ''
    }
  ];

  const mockProps = {
    items: mockCartItems,
    onUpdateQuantity: vi.fn(),
    onRemoveItem: vi.fn(),
    onClearCart: vi.fn(),
    onCheckout: vi.fn()
  };

  it('renders cart items correctly', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity when quantity is changed', () => {
    render(<Cart {...mockProps} />);
    
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    
    expect(mockProps.onUpdateQuantity).toHaveBeenCalledWith('1', 3);
  });

  it('calls onRemoveItem when remove button is clicked', () => {
    render(<Cart {...mockProps} />);
    
    const removeButton = screen.getByText('Remover');
    fireEvent.click(removeButton);
    
    expect(mockProps.onRemoveItem).toHaveBeenCalledWith('1');
  });

  it('displays correct total', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
  });
});
