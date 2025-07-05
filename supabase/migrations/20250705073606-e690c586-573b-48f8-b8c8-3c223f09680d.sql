
-- Primeiro, vamos verificar e criar um restaurante padrão se não existir
INSERT INTO public.restaurants (id, name, email, phone, cnpj, address, status, plan_type, plan_expires_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Restaurante Demo',
  'demo@restaurante.com',
  '(11) 99999-9999',
  '12.345.678/0001-90',
  'Rua Demo, 123 - Centro',
  'active',
  'premium',
  NOW() + INTERVAL '365 days'
)
ON CONFLICT (id) DO NOTHING;

-- Atualizar usuários existentes para associá-los ao restaurante demo
UPDATE public.user_profiles 
SET restaurant_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE restaurant_id IS NULL;

-- Criar configurações padrão para o restaurante demo
INSERT INTO public.restaurant_settings (restaurant_id)
VALUES ('550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (restaurant_id) DO NOTHING;

-- Criar categorias de produtos
INSERT INTO public.product_categories (id, restaurant_id, name, description, display_order, is_active) VALUES
('cat-bebidas-001', '550e8400-e29b-41d4-a716-446655440001', 'Bebidas', 'Bebidas geladas e quentes', 1, true),
('cat-pratos-001', '550e8400-e29b-41d4-a716-446655440001', 'Pratos Principais', 'Pratos principais do cardápio', 2, true),
('cat-sobremesas-001', '550e8400-e29b-41d4-a716-446655440001', 'Sobremesas', 'Doces e sobremesas', 3, true),
('cat-aperitivos-001', '550e8400-e29b-41d4-a716-446655440001', 'Aperitivos', 'Entradas e petiscos', 0, true)
ON CONFLICT (id) DO NOTHING;

-- Criar produtos de exemplo
INSERT INTO public.products (id, restaurant_id, category_id, name, description, price, image_url, is_active) VALUES
-- Bebidas
('prod-coca-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-bebidas-001', 'Coca-Cola 350ml', 'Refrigerante Coca-Cola lata 350ml gelada', 5.50, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300', true),
('prod-suco-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-bebidas-001', 'Suco de Laranja', 'Suco natural de laranja 300ml', 8.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300', true),
('prod-agua-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-bebidas-001', 'Água Mineral', 'Água mineral sem gás 500ml', 3.50, 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300', true),
('prod-cafe-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-bebidas-001', 'Café Expresso', 'Café expresso tradicional', 4.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300', true),

-- Pratos Principais
('prod-hamburguer-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-pratos-001', 'Hambúrguer Artesanal', 'Hambúrguer 180g, queijo, alface, tomate, batata frita', 25.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', true),
('prod-pizza-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-pratos-001', 'Pizza Margherita', 'Pizza tradicional com molho, mussarela e manjericão', 32.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300', true),
('prod-prato-feito-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-pratos-001', 'Prato Feito', 'Arroz, feijão, bife acebolado, ovo e salada', 18.50, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300', true),
('prod-lasanha-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-pratos-001', 'Lasanha à Bolonhesa', 'Lasanha tradicional com molho bolonhesa e queijo', 28.00, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300', true),

-- Aperitivos
('prod-porcao-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-aperitivos-001', 'Porção de Batata Frita', 'Batata frita crocante com molho especial', 12.90, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300', true),
('prod-coxinha-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-aperitivos-001', 'Coxinha de Frango', 'Porção com 6 coxinhas de frango com catupiry', 15.00, 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=300', true),
('prod-pastel-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-aperitivos-001', 'Pastel de Queijo', 'Pastel crocante recheado com queijo', 8.50, 'https://images.unsplash.com/photo-1601314002957-c8da8c1dbb8f?w=300', true),

-- Sobremesas
('prod-pudim-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-sobremesas-001', 'Pudim de Leite', 'Pudim caseiro de leite condensado', 9.90, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300', true),
('prod-brigadeiro-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-sobremesas-001', 'Brigadeiro Gourmet', 'Porção com 4 brigadeiros gourmet', 12.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300', true),
('prod-sorvete-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-sobremesas-001', 'Sorvete 2 Bolas', 'Sorvete de chocolate e baunilha', 7.50, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300', true)
ON CONFLICT (id) DO NOTHING;

-- Criar alguns adicionais para os produtos
INSERT INTO public.product_addons (id, product_id, name, price, is_active) VALUES
-- Adicionais para Hambúrguer
('addon-bacon-001', 'prod-hamburguer-001', 'Bacon', 3.50, true),
('addon-queijo-extra-001', 'prod-hamburguer-001', 'Queijo Extra', 2.00, true),
('addon-cebola-001', 'prod-hamburguer-001', 'Cebola Caramelizada', 1.50, true),

-- Adicionais para Pizza
('addon-borda-001', 'prod-pizza-001', 'Borda Recheada', 8.00, true),
('addon-azeitona-001', 'prod-pizza-001', 'Azeitonas', 2.50, true),

-- Adicionais para Café
('addon-leite-001', 'prod-cafe-001', 'Leite Extra', 1.00, true),
('addon-acucar-001', 'prod-cafe-001', 'Açúcar Cristal', 0.50, true),

-- Adicionais para Batata Frita
('addon-queijo-batata-001', 'prod-porcao-001', 'Queijo Derretido', 4.00, true),
('addon-bacon-batata-001', 'prod-porcao-001', 'Bacon em Cubos', 5.00, true)
ON CONFLICT (id) DO NOTHING;

-- Criar algumas mesas para o restaurante
INSERT INTO public.restaurant_tables (id, restaurant_id, table_number, seats, status) VALUES
('table-001', '550e8400-e29b-41d4-a716-446655440001', 1, 4, 'available'),
('table-002', '550e8400-e29b-41d4-a716-446655440001', 2, 2, 'available'),
('table-003', '550e8400-e29b-41d4-a716-446655440001', 3, 6, 'available'),
('table-004', '550e8400-e29b-41d4-a716-446655440001', 4, 4, 'available'),
('table-005', '550e8400-e29b-41d4-a716-446655440001', 5, 2, 'available'),
('table-006', '550e8400-e29b-41d4-a716-446655440001', 6, 8, 'available')
ON CONFLICT (id) DO NOTHING;

-- Criar inventário para os produtos
INSERT INTO public.inventory (restaurant_id, product_id, current_stock, min_stock, max_stock, unit_cost) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440001',
  p.id,
  50, -- estoque atual
  10, -- estoque mínimo
  100, -- estoque máximo
  p.price * 0.6 -- custo unitário (60% do preço de venda)
FROM public.products p 
WHERE p.restaurant_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT (restaurant_id, product_id) DO NOTHING;

-- Atualizar a função handle_new_user para associar automaticamente ao restaurante demo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, role, restaurant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'restaurant_owner',
    '550e8400-e29b-41d4-a716-446655440001' -- Associar automaticamente ao restaurante demo
  );
  RETURN NEW;
END;
$$;
