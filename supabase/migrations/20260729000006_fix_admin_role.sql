-- ─── 1. Corrigir dados: usuários com empresa_id que acabaram como super_admin ──
-- Isso afeta usuários criados pelo AdminPanel que receberam role errado.
-- super_admin + empresa_id != NULL → devem ser 'admin'
UPDATE public.user_profiles
SET role = 'admin'::user_role, updated_at = NOW()
WHERE role = 'super_admin'
  AND empresa_id IS NOT NULL;

-- ─── 2. Corrigir trigger: usar ON CONFLICT DO NOTHING ─────────────────────────
-- Garante que handle_new_user_profile não sobrescreva nem bloqueie admin_create_user
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'usuario'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ─── 3. Eliminar ambiguidade: dropar versão antiga de 3 parâmetros ─────────────
-- admin_create_user(text, text, text) vs admin_create_user(text, text, text, uuid)
-- PostgREST pode chamar a versão errada causando empresa_id NULL
DROP FUNCTION IF EXISTS public.admin_create_user(TEXT, TEXT, TEXT);
