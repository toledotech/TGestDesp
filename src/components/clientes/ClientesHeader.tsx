import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, TrendingUp, Mail, Phone, MapPin } from "lucide-react"

interface ClientesStats {
  total: number
  comEmail: number
  comTelefone: number
  comEndereco: number
  percentualCompleto: number
}

interface ClientesHeaderProps {
  stats: ClientesStats
  searchTerm: string
  onSearchChange: (term: string) => void
  onNewCliente: () => void
  loading: boolean
}

export function ClientesHeader({
  stats,
  searchTerm,
  onSearchChange,
  onNewCliente,
  loading
}: ClientesHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Título e Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e informações de contato
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {stats.total} clientes
          </Badge>
          
          <Badge variant="default" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {stats.comEmail} com e-mail
          </Badge>
          
          <Badge variant="secondary" className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {stats.comTelefone} com telefone
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {stats.comEndereco} com endereço
          </Badge>

          {stats.percentualCompleto > 0 && (
            <Badge variant="default" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stats.percentualCompleto}% completo
            </Badge>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={onNewCliente}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
    </div>
  )
}