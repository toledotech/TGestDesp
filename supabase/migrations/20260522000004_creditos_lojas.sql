-- ─── Tabela de Créditos/Débitos por Loja ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS creditos_lojas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loja_id     UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  processo_id UUID REFERENCES processos(id) ON DELETE SET NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('credito', 'debito')),
  -- credito = a favor da loja (despachante deve à loja)
  -- debito  = a favor do despachante (loja deve ao despachante)
  descricao   TEXT NOT NULL,
  valor       NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  data        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE creditos_lojas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus próprios créditos"
  ON creditos_lojas FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam seus próprios créditos"
  ON creditos_lojas FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam seus próprios créditos"
  ON creditos_lojas FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus próprios créditos"
  ON creditos_lojas FOR DELETE USING (auth.uid() = user_id);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_creditos_lojas_loja_id ON creditos_lojas(loja_id);
CREATE INDEX IF NOT EXISTS idx_creditos_lojas_user_id ON creditos_lojas(user_id);
CREATE INDEX IF NOT EXISTS idx_creditos_lojas_processo_id ON creditos_lojas(processo_id);
