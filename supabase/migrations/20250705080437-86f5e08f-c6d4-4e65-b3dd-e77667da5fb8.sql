
-- Criar um usuário master com role admin
-- Primeiro, vamos inserir um usuário na tabela user_profiles com role admin
-- Este será o usuário master que pode acessar o painel /master

INSERT INTO public.user_profiles (id, name, role, restaurant_id)
VALUES (
  '00000000-0000-0000-0000-000000000001', -- ID fixo para facilitar
  'Master Admin',
  'admin',
  NULL -- Admin não precisa estar vinculado a um restaurante específico
);

-- Vamos também criar um registro de auth.users correspondente para este usuário
-- (Normalmente isso é feito automaticamente pelo Supabase Auth, mas vamos simular)
-- NOTA: Você precisará fazer login com este email/senha: master@admin.com / master123
