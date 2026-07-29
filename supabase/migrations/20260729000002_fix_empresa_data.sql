-- Corrigir dados da tabela empresas usando configuracoes_empresa como fonte
-- A migration anterior criou empresas com nome=display_name/email do usuário.
-- Aqui atualizamos com os dados reais que o usuário já havia configurado.

UPDATE public.empresas e
SET
  nome = COALESCE(NULLIF(ce.nome_empresa, ''), e.nome),
  cnpj = COALESCE(NULLIF(ce.cnpj, ''), e.cnpj)
FROM public.configuracoes_empresa ce
WHERE ce.empresa_id = e.id
  AND (ce.nome_empresa IS NOT NULL AND ce.nome_empresa <> '');
