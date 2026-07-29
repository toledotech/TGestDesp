import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface Empresa {
  id: string
  nome: string
  cnpj: string | null
  plano: string
  ativo: boolean
  total_users: number
  created_at: string
}

export interface EmpresaUser {
  user_id: string
  email: string
  display_name: string
  role: string
  is_banned: boolean
  created_at: string
}

export interface CriarEmpresaParams {
  nome: string
  cnpj?: string
  plano: string
  admin_nome?: string
  admin_email?: string
  admin_senha?: string
}

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('supermaster_list_empresas' as any)
      if (error) throw error
      setEmpresas((data as Empresa[]) ?? [])
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message ?? 'Erro ao listar empresas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEmpresaUsers = useCallback(async (empresaId: string): Promise<EmpresaUser[]> => {
    const { data, error } = await supabase.rpc('supermaster_list_empresa_users' as any, {
      p_empresa_id: empresaId
    })
    if (error) throw error
    return (data as EmpresaUser[]) ?? []
  }, [])

  const criarEmpresa = useCallback(async (params: CriarEmpresaParams) => {
    const { data, error } = await supabase.rpc('supermaster_create_empresa' as any, {
      p_nome:        params.nome,
      p_cnpj:        params.cnpj ?? null,
      p_plano:       params.plano,
      p_admin_nome:  params.admin_nome ?? null,
      p_admin_email: params.admin_email ?? null,
      p_admin_senha: params.admin_senha ?? null,
    })
    if (error) throw error
    await fetchEmpresas()
    return data as string
  }, [fetchEmpresas])

  const atualizarEmpresa = useCallback(async (
    empresaId: string,
    params: { nome: string; cnpj?: string; plano?: string; ativo?: boolean }
  ) => {
    const { error } = await supabase.rpc('supermaster_update_empresa' as any, {
      p_empresa_id: empresaId,
      p_nome:       params.nome,
      p_cnpj:       params.cnpj ?? null,
      p_plano:      params.plano ?? null,
      p_ativo:      params.ativo ?? null,
    })
    if (error) throw error
    await fetchEmpresas()
  }, [fetchEmpresas])

  const adicionarUsuario = useCallback(async (
    empresaId: string,
    params: { email: string; senha: string; nome?: string; role?: string }
  ) => {
    const { error } = await supabase.rpc('admin_create_user' as any, {
      p_email:      params.email,
      p_password:   params.senha,
      p_role:       params.role ?? 'admin',
      p_empresa_id: empresaId,
    })
    if (error) throw error
  }, [])

  return {
    empresas,
    loading,
    fetchEmpresas,
    fetchEmpresaUsers,
    criarEmpresa,
    atualizarEmpresa,
    adicionarUsuario,
  }
}
