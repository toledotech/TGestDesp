import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export type UserRole = 'admin' | 'gerente' | 'usuario'

export interface Permissions {
  processos: {
    read: boolean
    write: boolean
    delete: boolean
  }
  clientes: {
    read: boolean
    write: boolean
    delete: boolean
  }
  financeiro: {
    read: boolean
    write: boolean
    delete: boolean
  }
  relatorios: {
    read: boolean
    write: boolean
    delete: boolean
  }
  configuracoes: {
    read: boolean
    write: boolean
    delete: boolean
  }
}

export interface UserProfile {
  id: string
  user_id: string
  display_name?: string
  role: UserRole
  permissions: Permissions
}

export const usePermissions = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const defaultPermissions: Record<UserRole, Permissions> = {
    admin: {
      processos: { read: true, write: true, delete: true },
      clientes: { read: true, write: true, delete: true },
      financeiro: { read: true, write: true, delete: true },
      relatorios: { read: true, write: true, delete: true },
      configuracoes: { read: true, write: true, delete: true }
    },
    gerente: {
      processos: { read: true, write: true, delete: false },
      clientes: { read: true, write: true, delete: false },
      financeiro: { read: true, write: false, delete: false },
      relatorios: { read: true, write: false, delete: false },
      configuracoes: { read: true, write: false, delete: false }
    },
    usuario: {
      processos: { read: true, write: false, delete: false },
      clientes: { read: true, write: false, delete: false },
      financeiro: { read: false, write: false, delete: false },
      relatorios: { read: false, write: false, delete: false },
      configuracoes: { read: false, write: false, delete: false }
    }
  }

  const fetchUserProfile = async () => {
    if (!user) {
      setUserProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error)
        return
      }

      if (data) {
        setUserProfile({
          ...data,
          permissions: data.permissions as unknown as Permissions
        })
      } else {
        // Criar perfil padrão se não existir
        const newProfile = {
          user_id: user.id,
          display_name: user.user_metadata?.display_name || user.email,
          role: 'usuario' as UserRole,
          permissions: defaultPermissions.usuario
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            ...newProfile,
            permissions: newProfile.permissions as any
          })
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar perfil:', createError)
          toast({
            title: "Erro",
            description: "Não foi possível criar o perfil do usuário.",
            variant: "destructive"
          })
        } else {
          setUserProfile({
            ...createdProfile,
            permissions: createdProfile.permissions as unknown as Permissions
          })
        }
      }
    } catch (error) {
      console.error('Erro inesperado:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (role: UserRole) => {
    if (!userProfile) return false

    try {
      const permissions = defaultPermissions[role]
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ role, permissions: permissions as any })
        .eq('id', userProfile.id)

      if (error) {
        console.error('Erro ao atualizar role:', error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a função do usuário.",
          variant: "destructive"
        })
        return false
      }

      setUserProfile({ ...userProfile, role, permissions })
      toast({
        title: "Sucesso",
        description: "Função atualizada com sucesso!"
      })
      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      return false
    }
  }

  const updatePermissions = async (newPermissions: Permissions) => {
    if (!userProfile) return false

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ permissions: newPermissions as any })
        .eq('id', userProfile.id)

      if (error) {
        console.error('Erro ao atualizar permissões:', error)
        toast({
          title: "Erro",
          description: "Não foi possível atualizar as permissões.",
          variant: "destructive"
        })
        return false
      }

      setUserProfile({ ...userProfile, permissions: newPermissions })
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso!"
      })
      return true
    } catch (error) {
      console.error('Erro inesperado:', error)
      return false
    }
  }

  const hasPermission = (module: keyof Permissions, action: keyof Permissions[keyof Permissions]): boolean => {
    if (!userProfile) return false
    return userProfile.permissions[module][action] === true
  }

  const isAdmin = () => userProfile?.role === 'admin'
  const isGerente = () => userProfile?.role === 'gerente' || userProfile?.role === 'admin'

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  return {
    userProfile,
    loading,
    hasPermission,
    isAdmin,
    isGerente,
    updateUserRole,
    updatePermissions,
    defaultPermissions,
    refetch: fetchUserProfile
  }
}