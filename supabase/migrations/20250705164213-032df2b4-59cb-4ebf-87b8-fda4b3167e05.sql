
-- Adicionar campo de custo nos produtos
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;

-- Criar tabela para promoções
CREATE TABLE IF NOT EXISTS product_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL,
  promotional_price NUMERIC,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  banner_url TEXT,
  coupon_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para produtos em promoção
CREATE TABLE IF NOT EXISTS promotion_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES product_promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(promotion_id, product_id)
);

-- Criar tabela para observações/acompanhamentos
CREATE TABLE IF NOT EXISTS product_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para aplicar observações aos produtos
CREATE TABLE IF NOT EXISTS product_observation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  observation_id UUID NOT NULL REFERENCES product_observations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, observation_id)
);

-- RLS para product_promotions
ALTER TABLE product_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant users access their promotions" ON product_promotions
  FOR ALL USING (restaurant_id = get_current_user_restaurant_id());

-- RLS para promotion_products
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant users access their promotion products" ON promotion_products
  FOR ALL USING (promotion_id IN (SELECT id FROM product_promotions WHERE restaurant_id = get_current_user_restaurant_id()));

-- RLS para product_observations
ALTER TABLE product_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant users access their observations" ON product_observations
  FOR ALL USING (restaurant_id = get_current_user_restaurant_id());

-- RLS para product_observation_assignments
ALTER TABLE product_observation_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Restaurant users access their observation assignments" ON product_observation_assignments
  FOR ALL USING (product_id IN (SELECT id FROM products WHERE restaurant_id = get_current_user_restaurant_id()));

-- Criar bucket para banners de promoção
INSERT INTO storage.buckets (id, name, public)
VALUES ('promotion-banners', 'promotion-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Política para upload de banners
CREATE POLICY "Users can upload promotion banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'promotion-banners');

CREATE POLICY "Users can view promotion banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'promotion-banners');

CREATE POLICY "Users can update their promotion banners" ON storage.objects
  FOR UPDATE USING (bucket_id = 'promotion-banners');

CREATE POLICY "Users can delete their promotion banners" ON storage.objects
  FOR DELETE USING (bucket_id = 'promotion-banners');
