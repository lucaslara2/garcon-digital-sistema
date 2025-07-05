
-- Criar tabela para gerenciar assinaturas dos restaurantes
CREATE TABLE public.restaurant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'unpaid')),
  plan_type TEXT NOT NULL DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de pagamentos de assinaturas
CREATE TABLE public.subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER NOT NULL, -- em centavos
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL CHECK (status IN ('paid', 'open', 'void', 'uncollectible')),
  invoice_pdf TEXT, -- URL do PDF da fatura
  hosted_invoice_url TEXT, -- URL da fatura hospedada no Stripe
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas nouvelles tabelas
ALTER TABLE public.restaurant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para restaurant_subscriptions
CREATE POLICY "Restaurant owners can view their subscription" ON public.restaurant_subscriptions
  FOR SELECT USING (restaurant_id = get_current_user_restaurant_id());

CREATE POLICY "Admin can manage all subscriptions" ON public.restaurant_subscriptions
  FOR ALL USING (get_current_user_role() = 'admin');

-- Políticas RLS para subscription_invoices
CREATE POLICY "Restaurant owners can view their invoices" ON public.subscription_invoices
  FOR SELECT USING (restaurant_id = get_current_user_restaurant_id());

CREATE POLICY "Admin can manage all invoices" ON public.subscription_invoices
  FOR ALL USING (get_current_user_role() = 'admin');

-- Atualizar tabela restaurants para sincronizar com subscription
CREATE OR REPLACE FUNCTION sync_restaurant_plan_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar status e dados do plano no restaurante baseado na assinatura
  UPDATE public.restaurants 
  SET 
    status = CASE 
      WHEN NEW.status = 'active' THEN 'active'::restaurant_status
      WHEN NEW.status IN ('canceled', 'unpaid') THEN 'expired'::restaurant_status
      WHEN NEW.status = 'past_due' THEN 'pending'::restaurant_status
      ELSE status
    END,
    plan_type = NEW.plan_type::plan_type,
    plan_expires_at = NEW.current_period_end,
    updated_at = now()
  WHERE id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar automaticamente
CREATE TRIGGER sync_restaurant_plan_trigger
  AFTER INSERT OR UPDATE ON public.restaurant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_restaurant_plan_from_subscription();

-- Inserir dados padrão de assinatura para restaurantes existentes
INSERT INTO public.restaurant_subscriptions (restaurant_id, status, plan_type)
SELECT id, 'inactive', 'basic'
FROM public.restaurants 
WHERE id NOT IN (SELECT restaurant_id FROM public.restaurant_subscriptions);
