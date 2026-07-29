-- Corrige usuários que ficaram como super_admin sem ser o SuperMaster real.
-- O SuperMaster real é o mais antigo com role=super_admin.
-- Todos os outros super_admin são usuários de empresa e devem ser 'admin'.

DO $$
DECLARE
  v_supermaster_user_id UUID;
  v_empresa_id          UUID;
BEGIN
  -- SuperMaster original: o super_admin mais antigo
  SELECT user_id INTO v_supermaster_user_id
  FROM public.user_profiles
  WHERE role = 'super_admin'
  ORDER BY created_at ASC
  LIMIT 1;

  -- Empresa alvo: a mais antiga (K DESPACHANTE LTDA ou a única existente)
  SELECT id INTO v_empresa_id
  FROM public.empresas
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_supermaster_user_id IS NULL OR v_empresa_id IS NULL THEN
    RAISE NOTICE 'Nenhum super_admin ou nenhuma empresa encontrada. Nada a corrigir.';
    RETURN;
  END IF;

  -- Corrigir todos os super_admin que NÃO são o SuperMaster original
  UPDATE public.user_profiles
  SET
    role       = 'admin'::user_role,
    empresa_id = COALESCE(empresa_id, v_empresa_id),  -- manter se já tiver empresa_id
    updated_at = NOW()
  WHERE role    = 'super_admin'
    AND user_id != v_supermaster_user_id;

  RAISE NOTICE 'Correção aplicada. SuperMaster preservado: %', v_supermaster_user_id;
END;
$$;

-- Também reescreve admin_create_user com variável renomeada (v_empresa_id)
-- para evitar ambiguidade entre variável local e nome da coluna
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email      TEXT,
  p_password   TEXT,
  p_role       TEXT DEFAULT 'funcionario',
  p_empresa_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_new_user_id  UUID;
  v_permissions  JSONB;
  v_caller_role  TEXT;
  v_empresa_id   UUID;   -- renomeado para evitar confusão com coluna empresa_id
BEGIN
  SELECT get_user_role()::TEXT INTO v_caller_role;

  IF v_caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF v_caller_role = 'admin' AND p_role NOT IN ('funcionario', 'gerente', 'usuario') THEN
    RAISE EXCEPTION 'Administradores só podem criar funcionários ou gerentes';
  END IF;

  SELECT COALESCE(p_empresa_id, public.get_current_empresa_id()) INTO v_empresa_id;

  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'empresa_id é obrigatório para criar usuário';
  END IF;

  IF p_role IN ('super_admin', 'admin') THEN
    v_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSIF p_role = 'gerente' THEN
    v_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":true,"write":false,"delete":false},"relatorios":{"read":true,"write":false,"delete":false},"configuracoes":{"read":true,"write":false,"delete":false}}'::JSONB;
  ELSE
    v_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":false,"write":true,"delete":false},"relatorios":{"read":false,"write":false,"delete":false},"configuracoes":{"read":false,"write":false,"delete":false}}'::JSONB;
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
  ) RETURNING id INTO v_new_user_id;

  INSERT INTO public.user_profiles (user_id, display_name, role, permissions, empresa_id)
  VALUES (v_new_user_id, p_email, p_role::user_role, v_permissions, v_empresa_id)
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role         = EXCLUDED.role,
    permissions  = EXCLUDED.permissions,
    empresa_id   = EXCLUDED.empresa_id,
    updated_at   = NOW();

  INSERT INTO public.subscribers (email, subscription_tier)
  VALUES (p_email, 'Freemium')
  ON CONFLICT (email) DO NOTHING;

  RETURN v_new_user_id;
END;
$$;
