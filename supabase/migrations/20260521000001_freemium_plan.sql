-- ============================================================
-- PLANO FREEMIUM: padrão para todos os novos usuários
-- ============================================================

-- 1. Inserir plano Freemium (público, gratuito)
INSERT INTO public.subscription_plans
  (name, description, price_cents, currency, interval_type, features, is_active, is_public, user_id)
VALUES (
  'Freemium',
  'Plano gratuito para experimentar o sistema.',
  0,
  'brl',
  'month',
  '["Até 25 processos/mês", "1 usuário", "Relatórios básicos", "Suporte por email"]',
  true,
  true,
  NULL
);

-- 2. Atualizar trigger de criação de usuário para auto-atribuir Freemium
--    O ON CONFLICT (email) DO NOTHING garante que planos pré-atribuídos (ex: ETERNAL)
--    não sejam sobrescritos.
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar perfil de usuário
  INSERT INTO public.user_profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'usuario'
  );

  -- Atribuir plano Freemium automaticamente
  -- ON CONFLICT DO NOTHING preserva qualquer plano já atribuído antes do cadastro
  INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier)
  VALUES (NEW.id, NEW.email, true, 'Freemium')
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Função auxiliar: conta processos criados pelo usuário no mês corrente
CREATE OR REPLACE FUNCTION public.count_processos_mes(target_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
    FROM public.processos
   WHERE user_id = target_user_id
     AND created_at >= date_trunc('month', now())
     AND created_at  < date_trunc('month', now()) + INTERVAL '1 month';
$$;
