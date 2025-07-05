
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { vi } from 'vitest';

// Mock do useAuth
const mockSignOut = vi.fn();
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    userProfile: {
      name: 'João Silva',
      role: 'restaurant_owner',
      restaurant_id: '123'
    },
    signOut: mockSignOut
  })
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' })
  };
});

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o logo e nome da aplicação', () => {
    renderNavbar();
    
    expect(screen.getByText('RestaurantOS')).toBeInTheDocument();
    expect(screen.getByLabelText('RestaurantOS - Ir para dashboard')).toBeInTheDocument();
  });

  it('deve mostrar informações do usuário', () => {
    renderNavbar();
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Proprietário')).toBeInTheDocument();
  });

  it('deve mostrar menu de navegação desktop', () => {
    renderNavbar();
    
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /produtos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pdv/i })).toBeInTheDocument();
  });

  it('deve abrir menu mobile ao clicar no botão', () => {
    renderNavbar();
    
    const mobileMenuButton = screen.getByLabelText('Abrir menu de navegação');
    fireEvent.click(mobileMenuButton);
    
    const mobileMenu = screen.getByRole('menu', { name: 'Menu mobile' });
    expect(mobileMenu).toBeInTheDocument();
  });

  it('deve realizar logout ao clicar em sair', async () => {
    renderNavbar();
    
    const userMenuButton = screen.getByLabelText('Menu do usuário João Silva');
    fireEvent.click(userMenuButton);
    
    const logoutButton = screen.getByRole('menuitem', { name: /sair/i });
    fireEvent.click(logoutButton);
    
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('deve ser navegável por teclado', () => {
    renderNavbar();
    
    const logoLink = screen.getByLabelText('RestaurantOS - Ir para dashboard');
    expect(logoLink).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    
    const userMenuButton = screen.getByLabelText('Menu do usuário João Silva');
    expect(userMenuButton).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
  });

  it('deve ter navegação acessível com ARIA labels', () => {
    renderNavbar();
    
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(nav).toBeInTheDocument();
    
    const dashboardLink = screen.getByRole('button', { current: 'page' });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });
});
