
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductsGrid from '@/components/products/ProductsGrid';
import { vi } from 'vitest';

// Mock dos hooks
vi.mock('@/hooks/useProducts', () => ({
  useProducts: vi.fn(() => ({
    data: [
      {
        id: '1',
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 25.99,
        cost_price: 15.00,
        is_active: true,
        category: { name: 'Categoria Teste' },
        inventory: [{ current_stock: 10, min_stock: 5 }],
        product_observation_assignments: []
      }
    ],
    isLoading: false
  })),
  useDeleteProduct: vi.fn(() => ({
    mutate: vi.fn()
  }))
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ProductsGrid', () => {
  const mockOnEditProduct = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar produtos corretamente', () => {
    renderWithQueryClient(
      <ProductsGrid 
        selectedCategory="" 
        onEditProduct={mockOnEditProduct} 
      />
    );

    expect(screen.getByText('Produto Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do produto teste')).toBeInTheDocument();
    expect(screen.getByText('R$ 25,99')).toBeInTheDocument();
    expect(screen.getByText('Categoria Teste')).toBeInTheDocument();
  });

  it('deve calcular margem de lucro corretamente', () => {
    renderWithQueryClient(
      <ProductsGrid 
        selectedCategory="" 
        onEditProduct={mockOnEditProduct} 
      />
    );

    // Margem esperada: ((25.99 - 15.00) / 15.00) * 100 = 73.3%
    expect(screen.getByText('73,3%')).toBeInTheDocument();
  });

  it('deve mostrar status do estoque corretamente', () => {
    renderWithQueryClient(
      <ProductsGrid 
        selectedCategory="" 
        onEditProduct={mockOnEditProduct} 
      />
    );

    expect(screen.getByText('Estoque: 10')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('deve chamar onEditProduct ao clicar no botão editar', () => {
    renderWithQueryClient(
      <ProductsGrid 
        selectedCategory="" 
        onEditProduct={mockOnEditProduct} 
      />
    );

    const editButton = screen.getByLabelText('Editar produto Produto Teste');
    fireEvent.click(editButton);

    expect(mockOnEditProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        name: 'Produto Teste'
      })
    );
  });

  it('deve ser acessível com screen readers', () => {
    renderWithQueryClient(
      <ProductsGrid 
        selectedCategory="" 
        onEditProduct={mockOnEditProduct} 
      />
    );

    const grid = screen.getByRole('grid', { name: 'Lista de produtos' });
    expect(grid).toBeInTheDocument();

    const productCard = screen.getByRole('gridcell', { name: 'Produto Produto Teste' });
    expect(productCard).toBeInTheDocument();
    expect(productCard).toHaveAttribute('tabIndex', '0');
  });

  it('deve mostrar mensagem quando não há produtos', () => {
    vi.mocked(require('@/hooks/useProducts').useProducts).mockReturnValue({
      data: [],
      isLoading: false
    });

    renderWithQueryClient(
      <ProductsGrid 
        selectedCategory="" 
        onEditProduct={mockOnEditProduct} 
      />
    );

    expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
    expect(screen.getByText('Comece criando seu primeiro produto')).toBeInTheDocument();
  });
});
