-- Corrigir search_path das funções que usam gen_salt/crypt (pgcrypto fica em extensions)

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
SET search_path = public, extensions
AS $$
DECLARE
  nova_empresa_id UUID;
  novo_user_id    UUID;
  admin_perms     JSONB := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
BEGIN
  IF (SELECT get_user_role()::TEXT) <> 'super_admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas SuperMaster pode criar empresas';
  END IF;

  INSERT INTO public.empresas (nome, cnpj, plano)
  VALUES (p_nome, NULLIF(p_cnpj, ''), p_plano)
  RETURNING id INTO nova_empresa_id;

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
