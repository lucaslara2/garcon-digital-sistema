import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      name: 'Test Product',
      price: 10.00,
      quantity: 2,
      total: 20.00,
      notes: ''
    }
  ];

  const mockProps = {
    cart: mockCartItems,
    onAddToCart: vi.fn(),
    onRemoveFromCart: vi.fn(),
    onClearCart: vi.fn()
  };

  it('renders cart items correctly', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onAddToCart when plus button is clicked', async () => {
    const user = userEvent.setup();
    render(<Cart {...mockProps} />);
    
    const increaseButton = screen.getByRole('button', { name: /plus/i });
    await user.click(increaseButton);
    
    expect(mockProps.onAddToCart).toHaveBeenCalledWith(mockCartItems[0]);
  });

  it('calls onRemoveFromCart when minus button is clicked', async () => {
    const user = userEvent.setup();
    render(<Cart {...mockProps} />);
    
    const decreaseButton = screen.getByRole('button', { name: /minus/i });
    await user.click(decreaseButton);
    
    expect(mockProps.onRemoveFromCart).toHaveBeenCalledWith('1');
  });

  it('displays correct total', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('R$ 20,00')).toBeInTheDocument();
  });
});
