
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Cart } from '@/components/pos/Cart';

const mockCartItems = [
  {
    id: '1',
    name: 'Hambúrguer Artesanal',
    price: 25.90,
    quantity: 2,
    total: 51.80,
    addons: [
      { id: 'addon-1', name: 'Bacon', price: 3.50, quantity: 1 }
    ],
    notes: 'Sem cebola'
  },
  {
    id: '2',
    name: 'Coca-Cola 350ml',
    price: 5.50,
    quantity: 1,
    total: 5.50
  }
];

const mockProps = {
  cart: mockCartItems,
  onAddToCart: vi.fn(),
  onRemoveFromCart: vi.fn(),
  onClearCart: vi.fn()
};

describe('Cart Component', () => {
  it('renders cart items correctly', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('Hambúrguer Artesanal')).toBeInTheDocument();
    expect(screen.getByText('Coca-Cola 350ml')).toBeInTheDocument();
    expect(screen.getByText('2 itens')).toBeInTheDocument();
  });

  it('displays cart total correctly', () => {
    render(<Cart {...mockProps} />);
    
    // Should show total including addons
    expect(screen.getByText(/R\$ 64,30/)).toBeInTheDocument();
  });

  it('shows empty cart message when no items', () => {
    const emptyProps = { ...mockProps, cart: [] };
    render(<Cart {...emptyProps} />);
    
    expect(screen.getByText('Carrinho vazio')).toBeInTheDocument();
    expect(screen.getByText('Adicione produtos clicando nos itens do menu')).toBeInTheDocument();
  });

  it('calls onClearCart when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<Cart {...mockProps} />);
    
    const clearButton = screen.getByRole('button', { name: /trash/i });
    await user.click(clearButton);
    
    expect(mockProps.onClearCart).toHaveBeenCalled();
  });

  it('displays addons correctly', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('+ Bacon (1x)')).toBeInTheDocument();
    expect(screen.getByText('R$ 3,50')).toBeInTheDocument();
  });

  it('displays notes correctly', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('Sem cebola')).toBeInTheDocument();
  });
});
