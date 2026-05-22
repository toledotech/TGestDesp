-- Corrigir função update_updated_at_column com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Corrigir função generate_protocolo com search_path seguro
CREATE OR REPLACE FUNCTION public.generate_protocolo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    NEW.numero_protocolo = EXTRACT(YEAR FROM NOW()) || LPAD(nextval('protocolo_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$;