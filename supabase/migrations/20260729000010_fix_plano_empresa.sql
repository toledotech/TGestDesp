-- list_all_users: ler plano de empresas.plano em vez de subscribers
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
    COALESCE(e.plano, 'Freemium') AS subscription_tier,
    (au.banned_until IS NOT NULL AND au.banned_until > NOW()) AS is_banned,
    up.created_at
  FROM public.user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  LEFT JOIN public.empresas e ON e.id = up.empresa_id
  WHERE up.empresa_id = caller_empresa_id
  ORDER BY up.created_at DESC;
END;
$$;

-- Atualizar plano da K Despachante para ETERNAL
UPDATE public.empresas
SET plano = 'ETERNAL'
WHERE id = 'fd678af9-dc97-4b57-9265-2ecc7b5028a8';
