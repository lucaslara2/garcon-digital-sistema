
-- Função para criar usuário admin para restaurante (quando não existe)
CREATE OR REPLACE FUNCTION public.create_restaurant_user(
  restaurant_id uuid,
  email text,
  password text DEFAULT 'temp123456'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  restaurant_name text;
BEGIN
  -- Verificar se o usuário atual é admin
  IF (get_current_user_role() != 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem criar usuários';
  END IF;
  
  -- Buscar nome do restaurante
  SELECT name INTO restaurant_name FROM restaurants WHERE id = restaurant_id;
  
  IF restaurant_name IS NULL THEN
    RAISE EXCEPTION 'Restaurante não encontrado';
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
    email,
    crypt(password, gen_salt('bf')),
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

-- Função para garantir que um restaurante tenha um usuário
CREATE OR REPLACE FUNCTION public.ensure_restaurant_user(restaurant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_user_id uuid;
  restaurant_email text;
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
  
  -- Se não existe, buscar email do restaurante
  SELECT email INTO restaurant_email 
  FROM restaurants 
  WHERE id = restaurant_id;
  
  IF restaurant_email IS NULL THEN
    RAISE EXCEPTION 'Restaurante não encontrado ou sem email configurado';
  END IF;
  
  -- Criar novo usuário
  RETURN create_restaurant_user(restaurant_id, restaurant_email);
END;
$$;
