
import { render, screen, fireEvent } from '@testing-library/react';
import { Cart } from '@/components/pos/Cart';
import { describe, it, expect, vi } from 'vitest';

const mockCartItem = {
  id: '1',
  name: 'Pizza Margherita',
  price: 25.90,
  quantity: 2,
  total: 51.80,
  addons: [
    { id: 'addon1', name: 'Queijo Extra', price: 5.00, quantity: 1 }
  ],
  notes: 'Sem cebola'
};

const mockProps = {
  cart: [mockCartItem],
  onAddToCart: vi.fn(),
  onRemoveFromCart: vi.fn(),
  onClearCart: vi.fn()
};

describe('Cart Component', () => {
  it('should render cart items correctly', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
    expect(screen.getByText('R$ 25,90 cada')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display addons correctly', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('Adicionais:')).toBeInTheDocument();
    expect(screen.getByText('+ Queijo Extra (1x)')).toBeInTheDocument();
    expect(screen.getByText('R$ 5,00')).toBeInTheDocument();
  });

  it('should display notes when present', () => {
    render(<Cart {...mockProps} />);
    
    expect(screen.getByText('Obs:')).toBeInTheDocument();
    expect(screen.getByText('Sem cebola')).toBeInTheDocument();
  });

  it('should call onAddToCart when plus button is clicked', () => {
    render(<Cart {...mockProps} />);
    
    const plusButton = screen.getByRole('button', { name: /\+/ });
    fireEvent.click(plusButton);
    
    expect(mockProps.onAddToCart).toHaveBeenCalledWith(mockCartItem);
  });

  it('should call onRemoveFromCart when minus button is clicked', () => {
    render(<Cart {...mockProps} />);
    
    const minusButton = screen.getByRole('button', { name: /-/ });
    fireEvent.click(minusButton);
    
    expect(mockProps.onRemoveFromCart).toHaveBeenCalledWith('1');
  });

  it('should show empty cart message when cart is empty', () => {
    render(<Cart {...mockProps} cart={[]} />);
    
    expect(screen.getByText('Carrinho vazio')).toBeInTheDocument();
    expect(screen.getByText('Adicione produtos clicando nos itens do menu')).toBeInTheDocument();
  });
});
