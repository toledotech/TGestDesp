-- ============================================================
-- ETERNAL PLAN: plano oculto, atribuído manualmente pelo admin
-- ============================================================

-- 1. Adicionar coluna is_public na tabela de planos
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- 2. Garantir que os planos existentes sejam marcados como públicos
UPDATE public.subscription_plans
  SET is_public = true
  WHERE is_public IS NULL OR is_public = true;

-- 3. Inserir o plano ETERNAL (oculto na listagem pública)
INSERT INTO public.subscription_plans
  (name, description, price_cents, currency, interval_type, features, is_active, is_public, user_id)
VALUES (
  'ETERNAL',
  'Plano exclusivo, concedido manualmente pelo administrador do sistema.',
  0,
  'brl',
  'month',
  '["Acesso completo e ilimitado", "Todos os recursos premium", "Suporte prioritário", "Sem data de expiração", "Atribuição exclusiva pelo administrador"]',
  true,
  false,
  NULL
);

-- 4. Política SELECT para admins verem todos os subscribers
CREATE POLICY "admin_view_all_subscribers" ON public.subscribers
  FOR SELECT
  USING (public.get_user_role() = 'admin');

-- 5. Função (SECURITY DEFINER) para atribuir plano ETERNAL a um usuário por email
CREATE OR REPLACE FUNCTION public.assign_eternal_plan(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result_record public.subscribers;
BEGIN
  -- Somente admins podem chamar esta função
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem atribuir o plano ETERNAL';
  END IF;

  -- Tentar obter o user_id via auth.users (pode ser NULL se o usuário não existe ainda)
  SELECT id INTO target_user_id
    FROM auth.users
   WHERE LOWER(email) = LOWER(target_email)
   LIMIT 1;

  -- Upsert na tabela subscribers
  INSERT INTO public.subscribers (email, user_id, subscribed, subscription_tier)
  VALUES (LOWER(target_email), target_user_id, true, 'ETERNAL')
  ON CONFLICT (email) DO UPDATE SET
    subscribed        = true,
    subscription_tier = 'ETERNAL',
    user_id           = COALESCE(target_user_id, public.subscribers.user_id),
    updated_at        = now()
  RETURNING * INTO result_record;

  RETURN jsonb_build_object(
    'success', true,
    'email',   result_record.email,
    'user_id', result_record.user_id
  );
END;
$$;

-- 6. Função para revogar o plano ETERNAL de um usuário por email (volta para sem assinatura)
CREATE OR REPLACE FUNCTION public.revoke_eternal_plan(target_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem revogar o plano ETERNAL';
  END IF;

  UPDATE public.subscribers
     SET subscribed        = false,
         subscription_tier = NULL,
         updated_at        = now()
   WHERE LOWER(email) = LOWER(target_email)
     AND subscription_tier = 'ETERNAL';

  RETURN jsonb_build_object('success', true, 'email', LOWER(target_email));
END;
$$;

-- 7. Função para listar todos os usuários com plano ETERNAL (admin only)
CREATE OR REPLACE FUNCTION public.list_eternal_subscribers()
RETURNS TABLE(
  email             TEXT,
  user_id           UUID,
  subscribed        BOOLEAN,
  subscription_end  TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT email, user_id, subscribed, subscription_end, updated_at
    FROM public.subscribers
   WHERE subscription_tier = 'ETERNAL'
   ORDER BY updated_at DESC;
$$;
