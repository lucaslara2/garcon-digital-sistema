
-- Verificar e corrigir a estrutura da tabela tickets
-- Remover constraint que pode estar causando problemas
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_category_check;

-- Adicionar constraint correta para categoria
ALTER TABLE public.tickets ADD CONSTRAINT tickets_category_check 
CHECK (category IN ('technical', 'support', 'implementation', 'billing', 'general'));

-- Verificar se a coluna category permite 'implementation'
UPDATE public.tickets SET category = 'implementation' WHERE category = 'implementacao';

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tickets_restaurant_category ON public.tickets(restaurant_id, category);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
