-- ─── Listar todos os usuários (admin) ───────────────────────────────────────

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
  IF (SELECT get_user_role()) <> 'admin' THEN
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

-- ─── Alterar papel de qualquer usuário (admin) ───────────────────────────────

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
  IF (SELECT get_user_role()) <> 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF new_role = 'admin' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSIF new_role = 'gerente' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":true,"write":false,"delete":false},"relatorios":{"read":true,"write":false,"delete":false},"configuracoes":{"read":true,"write":false,"delete":false}}'::JSONB;
  ELSE
    default_permissions := '{"processos":{"read":true,"write":false,"delete":false},"clientes":{"read":true,"write":false,"delete":false},"financeiro":{"read":false,"write":false,"delete":false},"relatorios":{"read":false,"write":false,"delete":false},"configuracoes":{"read":false,"write":false,"delete":false}}'::JSONB;
  END IF;

  UPDATE user_profiles
  SET role = new_role::user_role, permissions = default_permissions, updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;

-- ─── Criar usuário (admin) ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION admin_create_user(
  p_email    TEXT,
  p_password TEXT,
  p_role     TEXT DEFAULT 'usuario'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id         UUID;
  default_permissions JSONB;
BEGIN
  IF (SELECT get_user_role()) <> 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_role = 'admin' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSIF p_role = 'gerente' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":true,"write":false,"delete":false},"relatorios":{"read":true,"write":false,"delete":false},"configuracoes":{"read":true,"write":false,"delete":false}}'::JSONB;
  ELSE
    default_permissions := '{"processos":{"read":true,"write":false,"delete":false},"clientes":{"read":true,"write":false,"delete":false},"financeiro":{"read":false,"write":false,"delete":false},"relatorios":{"read":false,"write":false,"delete":false},"configuracoes":{"read":false,"write":false,"delete":false}}'::JSONB;
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

-- ─── Editar dados do usuário (admin) ────────────────────────────────────────

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
BEGIN
  IF (SELECT get_user_role()) <> 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Captura e-mail antigo antes de atualizar
  SELECT email INTO old_email FROM auth.users WHERE id = target_user_id;

  IF p_role = 'admin' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":true},"clientes":{"read":true,"write":true,"delete":true},"financeiro":{"read":true,"write":true,"delete":true},"relatorios":{"read":true,"write":true,"delete":true},"configuracoes":{"read":true,"write":true,"delete":true}}'::JSONB;
  ELSIF p_role = 'gerente' THEN
    default_permissions := '{"processos":{"read":true,"write":true,"delete":false},"clientes":{"read":true,"write":true,"delete":false},"financeiro":{"read":true,"write":false,"delete":false},"relatorios":{"read":true,"write":false,"delete":false},"configuracoes":{"read":true,"write":false,"delete":false}}'::JSONB;
  ELSE
    default_permissions := '{"processos":{"read":true,"write":false,"delete":false},"clientes":{"read":true,"write":false,"delete":false},"financeiro":{"read":false,"write":false,"delete":false},"relatorios":{"read":false,"write":false,"delete":false},"configuracoes":{"read":false,"write":false,"delete":false}}'::JSONB;
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

-- ─── Inativar / Reativar usuário (admin) ────────────────────────────────────

CREATE OR REPLACE FUNCTION admin_ban_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT get_user_role()) <> 'admin' THEN
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
  IF (SELECT get_user_role()) <> 'admin' THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  UPDATE auth.users SET banned_until = NULL WHERE id = target_user_id;
END;
$$;
