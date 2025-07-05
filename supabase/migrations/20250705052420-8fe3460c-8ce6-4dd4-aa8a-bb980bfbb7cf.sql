
-- Criar tabela para adicionais dos produtos
CREATE TABLE public.product_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para adicionais dos itens do pedido
CREATE TABLE public.order_item_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
  addon_id UUID REFERENCES public.product_addons(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para campanhas de WhatsApp
CREATE TABLE public.whatsapp_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  coupon_code TEXT,
  discount_percentage NUMERIC DEFAULT 0,
  target_audience TEXT DEFAULT 'all', -- 'all', 'frequent_customers', 'inactive_customers'
  sent_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos necessários à tabela orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS printed_at TIMESTAMP WITH TIME ZONE;

-- Adicionar campos necessários à tabela clients para login
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_whatsapp_enabled BOOLEAN DEFAULT true;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para product_addons
CREATE POLICY "Restaurant users access their product addons" ON public.product_addons
  FOR ALL USING (product_id IN (
    SELECT id FROM public.products WHERE restaurant_id = get_current_user_restaurant_id()
  ));

-- Políticas RLS para order_item_addons  
CREATE POLICY "Restaurant users access their order item addons" ON public.order_item_addons
  FOR ALL USING (order_item_id IN (
    SELECT oi.id FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.restaurant_id = get_current_user_restaurant_id()
  ));

-- Políticas RLS para whatsapp_campaigns
CREATE POLICY "Restaurant users access their campaigns" ON public.whatsapp_campaigns
  FOR ALL USING (restaurant_id = get_current_user_restaurant_id());

-- Função para calcular total do pedido com adicionais
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_amount NUMERIC := 0;
BEGIN
  -- Soma os itens do pedido
  SELECT COALESCE(SUM(oi.total_price), 0) INTO total_amount
  FROM order_items oi
  WHERE oi.order_id = order_uuid;
  
  -- Soma os adicionais
  SELECT total_amount + COALESCE(SUM(oia.total_price), 0) INTO total_amount
  FROM order_item_addons oia
  JOIN order_items oi ON oi.id = oia.order_item_id
  WHERE oi.order_id = order_uuid;
  
  RETURN total_amount;
END;
$$ LANGUAGE plpgsql;
