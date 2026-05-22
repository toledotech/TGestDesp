-- ─── Campos DUT, Boleto e Loja nos Processos ────────────────────────────────
-- Nota: loja_id já foi adicionado em 20260522000002_lojas.sql
ALTER TABLE processos ADD COLUMN IF NOT EXISTS valor_dut     NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE processos ADD COLUMN IF NOT EXISTS valor_boleto  NUMERIC(10,2) NOT NULL DEFAULT 0;
