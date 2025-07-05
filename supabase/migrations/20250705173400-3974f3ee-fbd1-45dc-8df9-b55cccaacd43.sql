
-- Função para resetar senha de usuário (para master admin)
CREATE OR REPLACE FUNCTION public.reset_user_password(
  user_id uuid,
  new_password text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF (get_current_user_role() != 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem resetar senhas';
  END IF;
  
  -- Verificar se o usuário existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Atualizar a senha na tabela auth.users
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = user_id;
  
  -- Verificar se a atualização foi bem-sucedida
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Falha ao atualizar a senha do usuário';
  END IF;
  
  -- Log da operação
  INSERT INTO public.system_logs (
    action,
    user_id,
    details
  ) VALUES (
    'password_reset',
    auth.uid(),
    jsonb_build_object(
      'target_user_id', user_id,
      'timestamp', now()
    )
  );
END;
$$;

-- Função para garantir que um restaurante tenha um usuário de login
CREATE OR REPLACE FUNCTION public.ensure_restaurant_user(
  restaurant_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_user_id uuid;
  restaurant_email text;
  restaurant_name text;
  new_user_id uuid;
BEGIN
  -- Verificar se o usuário atual é admin
  IF (get_current_user_role() != 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem executar esta operação';
  END IF;
  
  -- Verificar se já existe um usuário para este restaurante
  SELECT up.id INTO existing_user_id
  FROM user_profiles up
  WHERE up.restaurant_id = ensure_restaurant_user.restaurant_id
    AND up.role = 'restaurant_owner'
  LIMIT 1;
  
  -- Se já existe, retornar o ID
  IF existing_user_id IS NOT NULL THEN
    RETURN existing_user_id;
  END IF;
  
  -- Buscar dados do restaurante
  SELECT email, name INTO restaurant_email, restaurant_name
  FROM restaurants 
  WHERE id = restaurant_id;
  
  IF restaurant_email IS NULL THEN
    RAISE EXCEPTION 'Restaurante não encontrado ou sem email configurado';
  END IF;
  
  -- Gerar ID para o novo usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    aud,
    role
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    restaurant_email,
    crypt('temp123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );
  
  -- Criar perfil do usuário
  INSERT INTO public.user_profiles (
    id,
    name,
    role,
    restaurant_id
  ) VALUES (
    new_user_id,
    restaurant_name,
    'restaurant_owner',
    restaurant_id
  );
  
  RETURN new_user_id;
END;
$$;
