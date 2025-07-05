
-- Atualizar a política RLS da tabela product_categories para permitir acesso total aos admins
DROP POLICY IF EXISTS "Restaurant users access their data" ON public.product_categories;

-- Criar nova política que permite tanto usuários de restaurante quanto admins
CREATE POLICY "Restaurant users and admins access categories" 
ON public.product_categories 
FOR ALL 
USING (
  restaurant_id = get_current_user_restaurant_id() 
  OR get_current_user_role() = 'admin'::user_role
);

-- Atualizar política similar para products se necessário
DROP POLICY IF EXISTS "Restaurant users access their data" ON public.products;

CREATE POLICY "Restaurant users and admins access products" 
ON public.products 
FOR ALL 
USING (
  restaurant_id = get_current_user_restaurant_id() 
  OR get_current_user_role() = 'admin'::user_role
);

-- Atualizar política para inventory
DROP POLICY IF EXISTS "Restaurant users access their inventory" ON public.inventory;

CREATE POLICY "Restaurant users and admins access inventory" 
ON public.inventory 
FOR ALL 
USING (
  restaurant_id = get_current_user_restaurant_id() 
  OR get_current_user_role() = 'admin'::user_role
);
