ALTER TABLE processos
  ADD COLUMN IF NOT EXISTS numero_processo TEXT,
  ADD COLUMN IF NOT EXISTS data_abertura DATE;

-- Tornar prazo opcional (remover NOT NULL se existir)
ALTER TABLE processos ALTER COLUMN prazo DROP NOT NULL;
