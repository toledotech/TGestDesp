-- ─── Adicionar novos valores ao enum user_role ──────────────────────────────
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'funcionario';

-- ─── Promover admins existentes a super_admin ────────────────────────────────
UPDATE user_profiles SET role = 'super_admin' WHERE role = 'admin';

-- ─── list_all_users (super_admin e admin podem listar) ───────────────────────
DROP FUNCTION IF EXISTS list_all_users();

CREATE OR REPLACE FUNCTION list_all_users()
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
BEGIN
  IF (SELECT get_user_role()) NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
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
  FROM user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  LEFT JOIN subscribers s ON s.email = au.email
  ORDER BY up.created_at DESC;
END;
$$;

-- ─── admin_update_user_role (somente super_admin) ────────────────────────────
CREATE OR REPLACE FUNCTION admin_update_user_role(
  target_user_id UUID,
  new_role       TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_permissions JSONB;
BEGIN
  IF (SELECT get_user_role()) <> 'super_admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF new_role = 'super_admin' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSIF new_role = 'admin' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSE
    default_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":false,"write":true,"delete":false},"relatorios":{"read":false,"write":false,"delete":false},"configuracoes":{"read":false,"write":false,"delete":false}}'::JSONB;
  END IF;

  UPDATE user_profiles
  SET role = new_role::user_role, permissions = default_permissions, updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;

-- ─── admin_create_user (super_admin cria qualquer role; admin só cria funcionario) ──
CREATE OR REPLACE FUNCTION admin_create_user(
  p_email    TEXT,
  p_password TEXT,
  p_role     TEXT DEFAULT 'funcionario'
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
BEGIN
  SELECT get_user_role() INTO caller_role;

  IF caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF caller_role = 'admin' AND p_role <> 'funcionario' THEN
    RAISE EXCEPTION 'Administradores só podem criar funcionários';
  END IF;

  IF p_role IN ('super_admin', 'admin') THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
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

  INSERT INTO user_profiles (user_id, display_name, role, permissions)
  VALUES (new_user_id, p_email, p_role::user_role, default_permissions);

  INSERT INTO subscribers (email, subscription_tier, subscribed_at)
  VALUES (p_email, 'Freemium', NOW())
  ON CONFLICT (email) DO NOTHING;

  RETURN new_user_id;
END;
$$;

-- ─── admin_update_user (super_admin edita tudo; admin edita apenas funcionarios) ──
CREATE OR REPLACE FUNCTION admin_update_user(
  target_user_id UUID,
  p_display_name TEXT,
  p_email        TEXT,
  p_role         TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_permissions JSONB;
  old_email           TEXT;
  caller_role         TEXT;
  target_role         TEXT;
BEGIN
  SELECT get_user_role() INTO caller_role;

  IF caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT role::TEXT INTO target_role FROM user_profiles WHERE user_id = target_user_id;

  IF caller_role = 'admin' AND target_role NOT IN ('funcionario', 'usuario') THEN
    RAISE EXCEPTION 'Administradores só podem editar funcionários';
  END IF;

  IF caller_role = 'admin' AND p_role <> 'funcionario' THEN
    RAISE EXCEPTION 'Administradores só podem atribuir o perfil Funcionário';
  END IF;

  SELECT email INTO old_email FROM auth.users WHERE id = target_user_id;

  IF p_role IN ('super_admin', 'admin') THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSE
    default_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":false,"write":true,"delete":false},"relatorios":{"read":false,"write":false,"delete":false},"configuracoes":{"read":false,"write":false,"delete":false}}'::JSONB;
  END IF;

  UPDATE auth.users
  SET email = p_email, email_confirmed_at = NOW(), updated_at = NOW()
  WHERE id = target_user_id;

  UPDATE user_profiles
  SET display_name = p_display_name, role = p_role::user_role,
      permissions = default_permissions, updated_at = NOW()
  WHERE user_id = target_user_id;

  UPDATE subscribers SET email = p_email WHERE email = old_email;
END;
$$;

-- ─── admin_ban_user / admin_unban_user (super_admin e admin) ─────────────────
CREATE OR REPLACE FUNCTION admin_ban_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT get_user_role()) NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  UPDATE auth.users SET banned_until = 'infinity'::TIMESTAMPTZ WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION admin_unban_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT get_user_role()) NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  UPDATE auth.users SET banned_until = NULL WHERE id = target_user_id;
END;
$$;
