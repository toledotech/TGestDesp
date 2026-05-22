-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'gerente', 'usuario');

-- Create user profiles table with roles
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role user_role NOT NULL DEFAULT 'usuario',
  permissions JSONB DEFAULT '{"processos": {"read": true, "write": false, "delete": false}, "clientes": {"read": true, "write": false, "delete": false}, "financeiro": {"read": false, "write": false, "delete": false}, "relatorios": {"read": false, "write": false, "delete": false}, "configuracoes": {"read": false, "write": false, "delete": false}}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id UUID DEFAULT NULL)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles 
  WHERE user_id = COALESCE(target_user_id, auth.uid());
$$;

-- Security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(module TEXT, action TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (permissions -> module ->> action)::boolean,
    false
  ) FROM public.user_profiles 
  WHERE user_id = auth.uid();
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'usuario'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Update timestamp trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();