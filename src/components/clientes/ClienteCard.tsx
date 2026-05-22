import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, User, Mail, Phone, MapPin } from "lucide-react"
import { Cliente } from "@/hooks/useClientes"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ClienteCardProps {
  cliente: Cliente
  onEdit: (cliente: Cliente) => void
  onDelete: (clienteId: string) => void
}

export function ClienteCard({ cliente, onEdit, onDelete }: ClienteCardProps) {
  const formatCpfCnpj = (cpfCnpj?: string) => {
    if (!cpfCnpj) return ''
    
    const numbers = cpfCnpj.replace(/\D/g, '')
    
    if (numbers.length === 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbers.length === 14) {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    
    return cpfCnpj
  }

  const getCompletudeScore = () => {
    let score = 1 // Nome sempre presente
    if (cliente.email) score++
    if (cliente.telefone) score++
    if (cliente.endereco) score++
    if (cliente.cpf_cnpj) score++
    return score
  }

  const getCompletudeColor = (score: number) => {
    if (score >= 4) return 'default'
    if (score >= 3) return 'secondary'
    return 'outline'
  }

  const completude = getCompletudeScore()

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{cliente.nome}</h3>
              {cliente.cpf_cnpj && (
                <p className="text-sm text-muted-foreground">
                  {formatCpfCnpj(cliente.cpf_cnpj)}
                </p>
              )}
            </div>
          </div>
          <Badge variant={getCompletudeColor(completude)} className="text-xs">
            {completude}/5 completo
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Informações de contato */}
        <div className="space-y-2">
          {cliente.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{cliente.email}</span>
            </div>
          )}
          
          {cliente.telefone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{cliente.telefone}</span>
            </div>
          )}
          
          {cliente.endereco && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{cliente.endereco}</span>
            </div>
          )}
        </div>

        {/* Data de cadastro */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Cadastrado em {format(new Date(cliente.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(cliente)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(cliente.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}