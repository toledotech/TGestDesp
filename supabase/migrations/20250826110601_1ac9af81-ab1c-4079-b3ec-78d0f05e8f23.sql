-- Criar tabela para configurações da empresa
CREATE TABLE public.configuracoes_empresa (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome_empresa text NOT NULL,
  cnpj text,
  razao_social text,
  inscricao_estadual text,
  inscricao_municipal text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  telefone text,
  celular text,
  email text,
  site text,
  logo_url text,
  cor_tema text DEFAULT '#2563eb',
  configuracoes_notificacao jsonb DEFAULT '{"email_processos": true, "email_prazos": true, "sms_urgentes": false}'::jsonb,
  configuracoes_sistema jsonb DEFAULT '{"auto_backup": true, "relatorio_mensal": true, "dashboard_inicial": "processos"}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own company settings" 
ON public.configuracoes_empresa 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company settings" 
ON public.configuracoes_empresa 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company settings" 
ON public.configuracoes_empresa 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company settings" 
ON public.configuracoes_empresa 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_empresa_updated_at
BEFORE UPDATE ON public.configuracoes_empresa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket para logos das empresas
INSERT INTO storage.buckets (id, name, public) VALUES ('logos-empresa', 'logos-empresa', true);

-- Políticas para o bucket de logos
CREATE POLICY "Users can view company logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos-empresa');

CREATE POLICY "Users can upload their own company logo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos-empresa' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own company logo" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos-empresa' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own company logo" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logos-empresa' AND auth.uid()::text = (storage.foldername(name))[1]);