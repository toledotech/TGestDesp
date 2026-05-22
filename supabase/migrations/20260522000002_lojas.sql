-- ─── Tabela de Lojas ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lojas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'Loja',
  cnpj        TEXT,
  telefone    TEXT,
  email       TEXT,
  contato     TEXT,
  observacoes TEXT,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem suas próprias lojas"
  ON lojas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam suas próprias lojas"
  ON lojas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam suas próprias lojas"
  ON lojas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam suas próprias lojas"
  ON lojas FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Vincular loja aos processos ─────────────────────────────────────────────
ALTER TABLE processos ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES lojas(id) ON DELETE SET NULL;

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_lojas_user_id ON lojas(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_loja_id ON processos(loja_id);
