
-- Função para atualizar e-mail do usuário (apenas para admins)
CREATE OR REPLACE FUNCTION public.update_user_email(user_id uuid, new_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF (get_current_user_role() != 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem alterar e-mails';
  END IF;
  
  -- Atualizar o e-mail na tabela auth.users
  UPDATE auth.users 
  SET email = new_email, 
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('email', new_email)
  WHERE id = user_id;
  
  -- Verificar se a atualização foi bem-sucedida
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
END;
$$;

-- Função para resetar senha do usuário (apenas para admins)
CREATE OR REPLACE FUNCTION public.reset_user_password(user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF (get_current_user_role() != 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem resetar senhas';
  END IF;
  
  -- Atualizar a senha na tabela auth.users
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('password_reset', true)
  WHERE id = user_id;
  
  -- Verificar se a atualização foi bem-sucedida
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
END;
$$;

-- Função para buscar informações de login do restaurante
CREATE OR REPLACE FUNCTION public.get_restaurant_login_info(restaurant_id uuid)
RETURNS TABLE(user_id uuid, email text, name text, role user_role)
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
