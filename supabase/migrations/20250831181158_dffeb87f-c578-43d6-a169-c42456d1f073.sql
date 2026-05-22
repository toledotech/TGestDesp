-- Criar tipo enum para tipo de transação
CREATE TYPE transacao_tipo AS ENUM ('receita', 'despesa');

-- Criar tabela de transações financeiras
CREATE TABLE public.transacoes_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo transacao_tipo NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
  processo_id UUID,
  cliente_id UUID,
  metodo_pagamento TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'pago', 'cancelado'
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own transactions" 
ON public.transacoes_financeiras 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transacoes_financeiras 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transacoes_financeiras 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transacoes_financeiras 
FOR DELETE 
USING (auth.uid() = user_id);

-- Adicionar foreign keys opcionais
ALTER TABLE public.transacoes_financeiras 
ADD CONSTRAINT fk_transacoes_processos 
FOREIGN KEY (processo_id) REFERENCES public.processos(id) ON DELETE SET NULL;

ALTER TABLE public.transacoes_financeiras 
ADD CONSTRAINT fk_transacoes_clientes 
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE SET NULL;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_transacoes_financeiras_updated_at
BEFORE UPDATE ON public.transacoes_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_transacoes_user_id ON public.transacoes_financeiras(user_id);
CREATE INDEX idx_transacoes_data ON public.transacoes_financeiras(data_transacao);
CREATE INDEX idx_transacoes_tipo ON public.transacoes_financeiras(tipo);
CREATE INDEX idx_transacoes_status ON public.transacoes_financeiras(status);