
-- Criar tabelas para o sistema de tickets
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'technical' CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.user_profiles(id)
);

-- Criar tabela para respostas dos tickets
CREATE TABLE public.ticket_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações dos restaurantes
CREATE TABLE public.restaurant_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  logo_url TEXT,
  opening_hours JSONB DEFAULT '{}',
  accepts_cash BOOLEAN DEFAULT true,
  accepts_card BOOLEAN DEFAULT true,
  accepts_pix BOOLEAN DEFAULT true,
  printer_ip TEXT,
  points_enabled BOOLEAN DEFAULT false,
  points_rate NUMERIC DEFAULT 1, -- pontos por real gasto
  delivery_enabled BOOLEAN DEFAULT false,
  delivery_fee NUMERIC DEFAULT 0,
  min_delivery_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para programa de pontos dos clientes
CREATE TABLE public.client_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  points_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, restaurant_id)
);

-- Criar tabela para histórico de pontos
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_points_id UUID REFERENCES public.client_points(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL, -- positivo para ganhar, negativo para gastar
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para cupons
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_product')),
  discount_value NUMERIC NOT NULL,
  product_id UUID REFERENCES public.products(id), -- para cupons de produto grátis
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER, -- NULL = ilimitado
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, code)
);

-- Criar tabela para uso de cupons
CREATE TABLE public.coupon_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  discount_applied NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas em orders para cupons e pontos
ALTER TABLE public.orders ADD COLUMN coupon_id UUID REFERENCES public.coupons(id);
ALTER TABLE public.orders ADD COLUMN coupon_discount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN points_earned INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN points_used INTEGER DEFAULT 0;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tickets
CREATE POLICY "Admin can manage all tickets" ON public.tickets
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Restaurant users can access their tickets" ON public.tickets
  FOR ALL USING (restaurant_id = get_current_user_restaurant_id());

-- Políticas RLS para ticket_responses
CREATE POLICY "Admin can manage all ticket responses" ON public.ticket_responses
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Restaurant users can access their ticket responses" ON public.ticket_responses
  FOR ALL USING (ticket_id IN (
    SELECT id FROM public.tickets WHERE restaurant_id = get_current_user_restaurant_id()
  ));

-- Políticas RLS para restaurant_settings
CREATE POLICY "Restaurant users access their settings" ON public.restaurant_settings
  FOR ALL USING (restaurant_id = get_current_user_restaurant_id());

-- Políticas RLS para client_points
CREATE POLICY "Restaurant users access their client points" ON public.client_points
  FOR ALL USING (restaurant_id = get_current_user_restaurant_id());

-- Políticas RLS para points_history
CREATE POLICY "Restaurant users access their points history" ON public.points_history
  FOR ALL USING (client_points_id IN (
    SELECT id FROM public.client_points WHERE restaurant_id = get_current_user_restaurant_id()
  ));

-- Políticas RLS para coupons
CREATE POLICY "Restaurant users access their coupons" ON public.coupons
  FOR ALL USING (restaurant_id = get_current_user_restaurant_id());

-- Políticas RLS para coupon_uses
CREATE POLICY "Restaurant users access their coupon uses" ON public.coupon_uses
  FOR ALL USING (coupon_id IN (
    SELECT id FROM public.coupons WHERE restaurant_id = get_current_user_restaurant_id()
  ));

-- Inserir configurações padrão para restaurantes existentes
INSERT INTO public.restaurant_settings (restaurant_id)
SELECT id FROM public.restaurants 
WHERE id NOT IN (SELECT restaurant_id FROM public.restaurant_settings);
