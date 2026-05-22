-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription plans table for admin management
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'brl',
  interval_type TEXT DEFAULT 'month', -- month, year
  stripe_price_id TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create policies for subscription plans
CREATE POLICY "view_all_plans" ON public.subscription_plans
FOR SELECT
USING (true);

CREATE POLICY "admin_manage_plans" ON public.subscription_plans
FOR ALL
USING (public.has_permission('configuracoes', 'write'));

-- Inserir planos padrão (user_id NULL = plano global do sistema)
INSERT INTO public.subscription_plans (name, description, price_cents, features, user_id) VALUES
('Básico', 'Plano básico para pequenos escritórios', 4900,
 '["Até 50 processos/mês", "2 usuários", "Relatórios básicos", "Suporte por email"]',
 NULL),
('Premium', 'Plano completo para médios escritórios', 9900,
 '["Até 200 processos/mês", "5 usuários", "Todos os relatórios", "Suporte prioritário", "Backup automático"]',
 NULL),
('Enterprise', 'Plano ilimitado para grandes escritórios', 19900,
 '["Processos ilimitados", "Usuários ilimitados", "Relatórios avançados", "Suporte 24/7", "Backup automático", "Integração personalizada"]',
 NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();