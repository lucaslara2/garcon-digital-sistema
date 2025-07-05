
-- Criar tabela para adicionais de produtos
CREATE TABLE IF NOT EXISTS public.product_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.product_addons ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários do restaurante gerenciem seus adicionais
CREATE POLICY "Restaurant users access their product addons" 
ON public.product_addons 
FOR ALL 
USING (
  product_id IN (
    SELECT id FROM public.products 
    WHERE restaurant_id = get_current_user_restaurant_id()
  )
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_addons_product_id ON public.product_addons(product_id);
