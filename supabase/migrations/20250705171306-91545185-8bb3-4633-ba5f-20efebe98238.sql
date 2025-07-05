
-- Corrigir a função get_restaurant_login_info para compatibilidade de tipos
CREATE OR REPLACE FUNCTION public.get_restaurant_login_info(restaurant_id uuid)
RETURNS TABLE(user_id uuid, email character varying, name text, role user_role)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF (get_current_user_role() != 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem acessar informações de login';
  END IF;
  
  RETURN QUERY
  SELECT 
    up.id,
    au.email,
    up.name,
    up.role
  FROM user_profiles up
  JOIN auth.users au ON au.id = up.id
  WHERE up.restaurant_id = get_restaurant_login_info.restaurant_id
    AND up.role = 'restaurant_owner'
  LIMIT 1;
END;
$$;
