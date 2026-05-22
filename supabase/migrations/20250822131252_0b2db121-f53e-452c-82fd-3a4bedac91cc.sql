-- Criar tabela de clientes
CREATE TABLE public.clientes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de veículos
CREATE TABLE public.veiculos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER,
    placa TEXT NOT NULL,
    chassi TEXT,
    renavam TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar enum para status dos processos
CREATE TYPE public.processo_status AS ENUM (
    'Recebido',
    'Em Conferência', 
    'No DETRAN',
    'Aguardando Pagamento',
    'Concluído'
);

-- Criar enum para tipos de serviços
CREATE TYPE public.servico_tipo AS ENUM (
    'Transferência de Propriedade',
    'Licenciamento Anual',
    '2ª Via CRV',
    'Comunicação de Venda',
    'IPVA',
    'Multas',
    'Outros'
);

-- Criar tabela de processos
CREATE TABLE public.processos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    numero_protocolo TEXT NOT NULL UNIQUE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE NOT NULL,
    servico servico_tipo NOT NULL,
    status processo_status NOT NULL DEFAULT 'Recebido',
    valor DECIMAL(10,2) NOT NULL,
    prazo DATE NOT NULL,
    observacoes TEXT,
    documentos_recebidos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clientes
CREATE POLICY "Users can view their own clientes" 
ON public.clientes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clientes" 
ON public.clientes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clientes" 
ON public.clientes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clientes" 
ON public.clientes FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para veículos
CREATE POLICY "Users can view their own veiculos" 
ON public.veiculos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own veiculos" 
ON public.veiculos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own veiculos" 
ON public.veiculos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own veiculos" 
ON public.veiculos FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para processos
CREATE POLICY "Users can view their own processos" 
ON public.processos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own processos" 
ON public.processos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processos" 
ON public.processos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own processos" 
ON public.processos FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de timestamps
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at
    BEFORE UPDATE ON public.veiculos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número de protocolo automaticamente
CREATE OR REPLACE FUNCTION public.generate_protocolo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.numero_protocolo = EXTRACT(YEAR FROM NOW()) || LPAD(nextval('protocolo_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequence para protocolo
CREATE SEQUENCE protocolo_seq START 1;

-- Trigger para gerar protocolo automaticamente
CREATE TRIGGER generate_protocolo_trigger
    BEFORE INSERT ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_protocolo();

-- Dados de exemplo removidos (user_id fictício não é compatível com RLS)