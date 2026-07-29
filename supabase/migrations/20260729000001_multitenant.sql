-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Multi-Tenancy com isolamento por empresa_id
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Tabela empresas ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.empresas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       TEXT NOT NULL,
  cnpj       TEXT,
  plano      TEXT NOT NULL DEFAULT 'Freemium',
  ativo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 2. Adicionar empresa_id (nullable) nas tabelas ───────────────────────────
ALTER TABLE public.user_profiles          ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL;
ALTER TABLE public.clientes               ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.veiculos               ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.processos              ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.transacoes_financeiras ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.lojas                  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.creditos_lojas         ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.compromissos           ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.configuracoes_empresa  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE;

-- ─── 3. Função helper para RLS ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_current_empresa_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM public.user_profiles WHERE user_id = auth.uid()
$$;

-- ─── 4. Trigger: auto-preencher empresa_id no INSERT ─────────────────────────
CREATE OR REPLACE FUNCTION public.set_empresa_id_from_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.empresa_id IS NULL THEN
    SELECT empresa_id INTO NEW.empresa_id
    FROM public.user_profiles WHERE user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_empresa_clientes
  BEFORE INSERT ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

CREATE TRIGGER set_empresa_veiculos
  BEFORE INSERT ON public.veiculos
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

CREATE TRIGGER set_empresa_processos
  BEFORE INSERT ON public.processos
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

CREATE TRIGGER set_empresa_financeiro
  BEFORE INSERT ON public.transacoes_financeiras
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

CREATE TRIGGER set_empresa_lojas
  BEFORE INSERT ON public.lojas
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

CREATE TRIGGER set_empresa_creditos_lojas
  BEFORE INSERT ON public.creditos_lojas
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

CREATE TRIGGER set_empresa_compromissos
  BEFORE INSERT ON public.compromissos
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

CREATE TRIGGER set_empresa_configuracoes
  BEFORE INSERT ON public.configuracoes_empresa
  FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user();

-- ─── 5. Migrar dados existentes (usuários não-super_admin) ────────────────────
DO $$
DECLARE
  r   RECORD;
  eid UUID;
BEGIN
  FOR r IN
    SELECT up.id AS profile_id, up.user_id, up.display_name, au.email
    FROM public.user_profiles up
    JOIN auth.users au ON au.id = up.user_id
    WHERE up.role::TEXT != 'super_admin'
      AND up.empresa_id IS NULL
  LOOP
    INSERT INTO public.empresas (nome)
    VALUES (COALESCE(NULLIF(r.display_name, r.email), r.email, 'Empresa'))
    RETURNING id INTO eid;

    UPDATE public.user_profiles          SET empresa_id = eid WHERE id = r.profile_id;
    UPDATE public.clientes               SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
    UPDATE public.veiculos               SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
    UPDATE public.processos              SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
    UPDATE public.transacoes_financeiras SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
    UPDATE public.lojas                  SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
    UPDATE public.creditos_lojas         SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
    UPDATE public.compromissos           SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
    UPDATE public.configuracoes_empresa  SET empresa_id = eid WHERE user_id = r.user_id AND empresa_id IS NULL;
  END LOOP;
END;
$$;

-- ─── 5b. Dados de super_admin que sobraram (empresa_id = NULL) ────────────────
-- Criamos uma empresa placeholder para não violar o NOT NULL abaixo
DO $$
DECLARE
  placeholder_id UUID;
  has_orphans    BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.processos WHERE empresa_id IS NULL LIMIT 1
  ) OR EXISTS(
    SELECT 1 FROM public.clientes WHERE empresa_id IS NULL LIMIT 1
  ) INTO has_orphans;

  IF has_orphans THEN
    INSERT INTO public.empresas (nome, plano) VALUES ('[Dados de Teste]', 'ETERNAL')
    RETURNING id INTO placeholder_id;

    UPDATE public.clientes               SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
    UPDATE public.veiculos               SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
    UPDATE public.processos              SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
    UPDATE public.transacoes_financeiras SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
    UPDATE public.lojas                  SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
    UPDATE public.creditos_lojas         SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
    UPDATE public.compromissos           SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
    UPDATE public.configuracoes_empresa  SET empresa_id = placeholder_id WHERE empresa_id IS NULL;
  END IF;
END;
$$;

-- ─── 6. NOT NULL nas tabelas de dados (após migração) ────────────────────────
ALTER TABLE public.clientes               ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.veiculos               ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.processos              ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.transacoes_financeiras ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.lojas                  ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.creditos_lojas         ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.compromissos           ALTER COLUMN empresa_id SET NOT NULL;
-- configuracoes_empresa pode ser NULL até a empresa configurar o sistema

-- ─── 7. Atualizar RLS policies ────────────────────────────────────────────────

-- empresas: usuário vê apenas sua própria empresa; SECURITY DEFINER funcs para SuperMaster
CREATE POLICY "empresa_select_own" ON public.empresas
  FOR SELECT USING (
    id = public.get_current_empresa_id()
    OR (SELECT role::TEXT FROM public.user_profiles WHERE user_id = auth.uid()) = 'super_admin'
  );

-- CLIENTES
DROP POLICY IF EXISTS "Users can view their own clientes"   ON public.clientes;
DROP POLICY IF EXISTS "Users can create their own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete their own clientes" ON public.clientes;

CREATE POLICY "empresa_select_clientes" ON public.clientes FOR SELECT USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_insert_clientes" ON public.clientes FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_update_clientes" ON public.clientes FOR UPDATE USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_delete_clientes" ON public.clientes FOR DELETE USING (empresa_id = public.get_current_empresa_id());

-- VEÍCULOS
DROP POLICY IF EXISTS "Users can view their own veiculos"   ON public.veiculos;
DROP POLICY IF EXISTS "Users can create their own veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Users can update their own veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Users can delete their own veiculos" ON public.veiculos;

CREATE POLICY "empresa_select_veiculos" ON public.veiculos FOR SELECT USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_insert_veiculos" ON public.veiculos FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_update_veiculos" ON public.veiculos FOR UPDATE USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_delete_veiculos" ON public.veiculos FOR DELETE USING (empresa_id = public.get_current_empresa_id());

-- PROCESSOS
DROP POLICY IF EXISTS "Users can view their own processos"   ON public.processos;
DROP POLICY IF EXISTS "Users can create their own processos" ON public.processos;
DROP POLICY IF EXISTS "Users can update their own processos" ON public.processos;
DROP POLICY IF EXISTS "Users can delete their own processos" ON public.processos;

CREATE POLICY "empresa_select_processos" ON public.processos FOR SELECT USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_insert_processos" ON public.processos FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_update_processos" ON public.processos FOR UPDATE USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_delete_processos" ON public.processos FOR DELETE USING (empresa_id = public.get_current_empresa_id());

-- TRANSAÇÕES FINANCEIRAS
DROP POLICY IF EXISTS "Users can view their own transactions"   ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transacoes_financeiras;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transacoes_financeiras;

CREATE POLICY "empresa_select_financeiro" ON public.transacoes_financeiras FOR SELECT USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_insert_financeiro" ON public.transacoes_financeiras FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_update_financeiro" ON public.transacoes_financeiras FOR UPDATE USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_delete_financeiro" ON public.transacoes_financeiras FOR DELETE USING (empresa_id = public.get_current_empresa_id());

-- LOJAS
DROP POLICY IF EXISTS "Usuários veem suas próprias lojas"       ON public.lojas;
DROP POLICY IF EXISTS "Usuários criam suas próprias lojas"      ON public.lojas;
DROP POLICY IF EXISTS "Usuários atualizam suas próprias lojas"  ON public.lojas;
DROP POLICY IF EXISTS "Usuários deletam suas próprias lojas"    ON public.lojas;

CREATE POLICY "empresa_select_lojas" ON public.lojas FOR SELECT USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_insert_lojas" ON public.lojas FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_update_lojas" ON public.lojas FOR UPDATE USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_delete_lojas" ON public.lojas FOR DELETE USING (empresa_id = public.get_current_empresa_id());

-- CRÉDITOS LOJAS
DROP POLICY IF EXISTS "Usuários veem seus próprios créditos"      ON public.creditos_lojas;
DROP POLICY IF EXISTS "Usuários criam seus próprios créditos"     ON public.creditos_lojas;
DROP POLICY IF EXISTS "Usuários atualizam seus próprios créditos" ON public.creditos_lojas;
DROP POLICY IF EXISTS "Usuários deletam seus próprios créditos"   ON public.creditos_lojas;

CREATE POLICY "empresa_select_creditos" ON public.creditos_lojas FOR SELECT USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_insert_creditos" ON public.creditos_lojas FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_update_creditos" ON public.creditos_lojas FOR UPDATE USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_delete_creditos" ON public.creditos_lojas FOR DELETE USING (empresa_id = public.get_current_empresa_id());

-- COMPROMISSOS
DROP POLICY IF EXISTS "users_own_compromissos" ON public.compromissos;
CREATE POLICY "empresa_all_compromissos" ON public.compromissos
  FOR ALL USING (empresa_id = public.get_current_empresa_id());

-- CONFIGURAÇÕES EMPRESA
DROP POLICY IF EXISTS "Users can view their own company settings"   ON public.configuracoes_empresa;
DROP POLICY IF EXISTS "Users can insert their own company settings" ON public.configuracoes_empresa;
DROP POLICY IF EXISTS "Users can update their own company settings" ON public.configuracoes_empresa;
DROP POLICY IF EXISTS "Users can delete their own company settings" ON public.configuracoes_empresa;

CREATE POLICY "empresa_select_configuracoes" ON public.configuracoes_empresa FOR SELECT USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_insert_configuracoes" ON public.configuracoes_empresa FOR INSERT WITH CHECK (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_update_configuracoes" ON public.configuracoes_empresa FOR UPDATE USING (empresa_id = public.get_current_empresa_id());
CREATE POLICY "empresa_delete_configuracoes" ON public.configuracoes_empresa FOR DELETE USING (empresa_id = public.get_current_empresa_id());

-- ─── 8. Corrigir numero_protocolo: unique por empresa ─────────────────────────
ALTER TABLE public.processos DROP CONSTRAINT IF EXISTS processos_numero_protocolo_key;
ALTER TABLE public.processos
  ADD CONSTRAINT processos_numero_protocolo_empresa UNIQUE (empresa_id, numero_protocolo);

-- ─── 9. Corrigir configuracoes_empresa: unique por empresa ────────────────────
ALTER TABLE public.configuracoes_empresa DROP CONSTRAINT IF EXISTS configuracoes_empresa_user_id_key;
ALTER TABLE public.configuracoes_empresa
  ADD CONSTRAINT configuracoes_empresa_empresa_id_key UNIQUE (empresa_id);

-- ─── 10. RPC helper: plano da empresa atual ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_my_plano()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.plano
  FROM public.empresas e
  JOIN public.user_profiles up ON up.empresa_id = e.id
  WHERE up.user_id = auth.uid()
$$;

-- ─── 11. Atualizar list_all_users: filtrar por empresa do caller ──────────────
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE (
  user_id           UUID,
  email             TEXT,
  display_name      TEXT,
  role              TEXT,
  subscription_tier TEXT,
  is_banned         BOOLEAN,
  created_at        TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role       TEXT;
  caller_empresa_id UUID;
BEGIN
  SELECT get_user_role()::TEXT, public.get_current_empresa_id()
  INTO caller_role, caller_empresa_id;

  IF caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF caller_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Use o painel administrativo para listar usuários por empresa';
  END IF;

  RETURN QUERY
  SELECT
    up.user_id,
    au.email::TEXT,
    up.display_name,
    up.role::TEXT,
    COALESCE(s.subscription_tier, 'Freemium') AS subscription_tier,
    (au.banned_until IS NOT NULL AND au.banned_until > NOW()) AS is_banned,
    up.created_at
  FROM public.user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  LEFT JOIN public.subscribers s ON s.email = au.email
  WHERE up.empresa_id = caller_empresa_id
  ORDER BY up.created_at DESC;
END;
$$;

-- ─── 12. Atualizar admin_create_user: herdar empresa_id do caller ─────────────
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email      TEXT,
  p_password   TEXT,
  p_role       TEXT DEFAULT 'funcionario',
  p_empresa_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id         UUID;
  default_permissions JSONB;
  caller_role         TEXT;
  empresa_id          UUID;
BEGIN
  SELECT get_user_role()::TEXT INTO caller_role;

  IF caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF caller_role = 'admin' AND p_role NOT IN ('funcionario', 'gerente', 'usuario') THEN
    RAISE EXCEPTION 'Administradores só podem criar funcionários ou gerentes';
  END IF;

  -- Usar empresa_id fornecida (SuperMaster) ou herdar do caller (admin de empresa)
  SELECT COALESCE(p_empresa_id, public.get_current_empresa_id()) INTO empresa_id;

  IF empresa_id IS NULL THEN
    RAISE EXCEPTION 'empresa_id é obrigatório para criar usuário';
  END IF;

  IF p_role IN ('super_admin', 'admin') THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSIF p_role = 'gerente' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":true,"write":false,"delete":false},"relatorios":{"read":true,"write":false,"delete":false},"configuracoes":{"read":true,"write":false,"delete":false}}'::JSONB;
  ELSE
    default_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":false,"write":true,"delete":false},"relatorios":{"read":false,"write":false,"delete":false},"configuracoes":{"read":false,"write":false,"delete":false}}'::JSONB;
  END IF;

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::JSONB,
    '{}'::JSONB,
    false, 'authenticated', 'authenticated'
  ) RETURNING id INTO new_user_id;

  -- ON CONFLICT para caso o trigger handle_new_user_profile já tenha inserido
  INSERT INTO public.user_profiles (user_id, display_name, role, permissions, empresa_id)
  VALUES (new_user_id, p_email, p_role::user_role, default_permissions, empresa_id)
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role         = EXCLUDED.role,
    permissions  = EXCLUDED.permissions,
    empresa_id   = EXCLUDED.empresa_id,
    updated_at   = NOW();

  INSERT INTO public.subscribers (email, subscription_tier, subscribed_at)
  VALUES (p_email, 'Freemium', NOW())
  ON CONFLICT (email) DO NOTHING;

  RETURN new_user_id;
END;
$$;

-- ─── 13. Atualizar count_processos_mes: usar empresa_id ──────────────────────
CREATE OR REPLACE FUNCTION public.count_processos_mes(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emp_id UUID;
BEGIN
  SELECT empresa_id INTO emp_id FROM public.user_profiles WHERE user_id = target_user_id;
  IF emp_id IS NULL THEN RETURN 0; END IF;
  RETURN (
    SELECT COUNT(*)::INTEGER FROM public.processos
    WHERE empresa_id = emp_id
      AND created_at >= date_trunc('month', NOW())
      AND created_at <  date_trunc('month', NOW()) + INTERVAL '1 month'
  );
END;
$$;

-- ─── 14. Nova RPC: supermaster_list_empresas ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.supermaster_list_empresas()
RETURNS TABLE (
  id          UUID,
  nome        TEXT,
  cnpj        TEXT,
  plano       TEXT,
  ativo       BOOLEAN,
  total_users BIGINT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT get_user_role()::TEXT) <> 'super_admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.nome,
    e.cnpj,
    e.plano,
    e.ativo,
    COUNT(up.id)::BIGINT AS total_users,
    e.created_at
  FROM public.empresas e
  LEFT JOIN public.user_profiles up ON up.empresa_id = e.id
  GROUP BY e.id
  ORDER BY e.created_at DESC;
END;
$$;

-- ─── 15. Nova RPC: supermaster_list_empresa_users ─────────────────────────────
CREATE OR REPLACE FUNCTION public.supermaster_list_empresa_users(p_empresa_id UUID)
RETURNS TABLE (
  user_id      UUID,
  email        TEXT,
  display_name TEXT,
  role         TEXT,
  is_banned    BOOLEAN,
  created_at   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT get_user_role()::TEXT) <> 'super_admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN QUERY
  SELECT
    up.user_id,
    au.email::TEXT,
    up.display_name,
    up.role::TEXT,
    (au.banned_until IS NOT NULL AND au.banned_until > NOW()) AS is_banned,
    up.created_at
  FROM public.user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  WHERE up.empresa_id = p_empresa_id
  ORDER BY up.created_at ASC;
END;
$$;

-- ─── 16. Nova RPC: supermaster_create_empresa ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.supermaster_create_empresa(
  p_nome        TEXT,
  p_cnpj        TEXT        DEFAULT NULL,
  p_plano       TEXT        DEFAULT 'Freemium',
  p_admin_nome  TEXT        DEFAULT NULL,
  p_admin_email TEXT        DEFAULT NULL,
  p_admin_senha TEXT        DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nova_empresa_id UUID;
  novo_user_id    UUID;
  admin_perms     JSONB := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
BEGIN
  IF (SELECT get_user_role()::TEXT) <> 'super_admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas SuperMaster pode criar empresas';
  END IF;

  -- Criar empresa
  INSERT INTO public.empresas (nome, cnpj, plano)
  VALUES (p_nome, NULLIF(p_cnpj, ''), p_plano)
  RETURNING id INTO nova_empresa_id;

  -- Criar usuário admin (opcional — empresa pode ser criada sem usuário inicial)
  IF p_admin_email IS NOT NULL AND p_admin_email <> '' AND
     p_admin_senha IS NOT NULL AND p_admin_senha <> '' THEN

    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      p_admin_email,
      crypt(p_admin_senha, gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::JSONB,
      '{}'::JSONB,
      false, 'authenticated', 'authenticated'
    ) RETURNING id INTO novo_user_id;

    INSERT INTO public.user_profiles (user_id, display_name, role, permissions, empresa_id)
    VALUES (
      novo_user_id,
      COALESCE(NULLIF(p_admin_nome, ''), p_admin_email),
      'admin',
      admin_perms,
      nova_empresa_id
    )
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      role         = EXCLUDED.role,
      permissions  = EXCLUDED.permissions,
      empresa_id   = EXCLUDED.empresa_id,
      updated_at   = NOW();

    INSERT INTO public.subscribers (email, subscription_tier, subscribed_at)
    VALUES (p_admin_email, p_plano, NOW())
    ON CONFLICT (email) DO UPDATE SET subscription_tier = EXCLUDED.subscription_tier;
  END IF;

  RETURN nova_empresa_id;
END;
$$;

-- ─── 17. Nova RPC: supermaster_update_empresa ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.supermaster_update_empresa(
  p_empresa_id UUID,
  p_nome       TEXT,
  p_cnpj       TEXT        DEFAULT NULL,
  p_plano      TEXT        DEFAULT NULL,
  p_ativo      BOOLEAN     DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT get_user_role()::TEXT) <> 'super_admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  UPDATE public.empresas SET
    nome       = p_nome,
    cnpj       = COALESCE(NULLIF(p_cnpj, ''), cnpj),
    plano      = COALESCE(NULLIF(p_plano, ''), plano),
    ativo      = COALESCE(p_ativo, ativo),
    updated_at = NOW()
  WHERE id = p_empresa_id;
END;
$$;
