import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { usePermissions, type UserRole, type Permissions } from '@/hooks/usePermissions'
import { Shield, User, Settings, FileText, DollarSign, Users, Briefcase } from 'lucide-react'

export const PermissionsManager = () => {
  const { userProfile, loading, updateUserRole, updatePermissions, defaultPermissions, isAdmin } = usePermissions()
  const [isEditing, setIsEditing] = useState(false)
  const [editingPermissions, setEditingPermissions] = useState<Permissions | null>(null)

  if (loading) {
    return <div className="text-center p-8">Carregando permissões...</div>
  }

  if (!userProfile) {
    return <div className="text-center p-8">Erro ao carregar permissões</div>
  }

  const startEditing = () => {
    setEditingPermissions({ ...userProfile.permissions })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingPermissions(null)
  }

  const savePermissions = async () => {
    if (editingPermissions) {
      const success = await updatePermissions(editingPermissions)
      if (success) {
        setIsEditing(false)
        setEditingPermissions(null)
      }
    }
  }

  const handleRoleChange = async (newRole: UserRole) => {
    await updateUserRole(newRole)
  }

  const handlePermissionChange = (module: keyof Permissions, action: string, value: boolean) => {
    if (!editingPermissions) return
    
    setEditingPermissions({
      ...editingPermissions,
      [module]: {
        ...editingPermissions[module],
        [action]: value
      }
    })
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'gerente':
        return 'default'
      case 'usuario':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const modules = [
    { key: 'processos', label: 'Processos', icon: Briefcase },
    { key: 'clientes', label: 'Clientes', icon: Users },
    { key: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { key: 'relatorios', label: 'Relatórios', icon: FileText },
    { key: 'configuracoes', label: 'Configurações', icon: Settings }
  ] as const

  const currentPermissions = isEditing ? editingPermissions : userProfile.permissions

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informações do Usuário
          </CardTitle>
          <CardDescription>
            Gerencie seu perfil e permissões de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4" />
              <span className="font-medium">{userProfile.display_name}</span>
            </div>
            <Badge variant={getRoleBadgeVariant(userProfile.role)}>
              {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
            </Badge>
          </div>

          {isAdmin() && (
            <div className="space-y-2">
              <Label htmlFor="role-select">Função do Sistema</Label>
              <Select value={userProfile.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permissões de Acesso</CardTitle>
              <CardDescription>
                Configure as permissões para cada módulo do sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={startEditing} variant="outline">
                  Editar Permissões
                </Button>
              ) : (
                <>
                  <Button onClick={cancelEditing} variant="outline">
                    Cancelar
                  </Button>
                  <Button onClick={savePermissions}>
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {modules.map(({ key, label, icon: Icon }) => (
              <div key={key} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {(['read', 'write', 'delete'] as const).map((action) => (
                    <div key={action} className="flex items-center space-x-2">
                      <Switch
                        id={`${key}-${action}`}
                        checked={currentPermissions?.[key]?.[action] || false}
                        onCheckedChange={(value) => 
                          isEditing && handlePermissionChange(key, action, value)
                        }
                        disabled={!isEditing}
                      />
                      <Label htmlFor={`${key}-${action}`} className="text-sm">
                        {action === 'read' && 'Visualizar'}
                        {action === 'write' && 'Editar'}
                        {action === 'delete' && 'Excluir'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}