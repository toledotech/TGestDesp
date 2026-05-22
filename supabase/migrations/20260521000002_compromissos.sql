-- ============================================================
-- COMPROMISSOS: agenda de atendimentos, reuniões e ligações
-- ============================================================

CREATE TABLE public.compromissos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo      TEXT        NOT NULL,
  descricao   TEXT,
  data_hora   TIMESTAMPTZ NOT NULL,
  cliente_id  UUID        REFERENCES public.clientes(id) ON DELETE SET NULL,
  tipo        TEXT        NOT NULL DEFAULT 'Atendimento',
  status      TEXT        NOT NULL DEFAULT 'agendado',  -- agendado | concluido | cancelado
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.compromissos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_compromissos" ON public.compromissos
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_compromissos_updated_at
  BEFORE UPDATE ON public.compromissos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
