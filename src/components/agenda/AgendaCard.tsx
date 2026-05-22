import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertTriangle, CheckCircle, User, Car } from "lucide-react"
import { AgendaItem } from "@/hooks/useAgenda"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AgendaCardProps {
  item: AgendaItem
  onClick?: () => void
}

export function AgendaCard({ item, onClick }: AgendaCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluido':
        return 'default'
      case 'em_andamento':
        return 'secondary'
      case 'aguardando_documentos':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = () => {
    if (item.diasRestantes < 0) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    }
    if (item.isCritico) {
      return <Clock className="h-4 w-4 text-warning" />
    }
    if (item.status === 'Concluido') {
      return <CheckCircle className="h-4 w-4 text-success" />
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getUrgencyBadge = () => {
    if (item.diasRestantes < 0) {
      return <Badge variant="destructive" className="text-xs">Vencido</Badge>
    }
    if (item.diasRestantes === 0) {
      return <Badge variant="destructive" className="text-xs">Hoje</Badge>
    }
    if (item.isCritico) {
      return <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">Crítico</Badge>
    }
    return null
  }

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        item.diasRestantes < 0 
          ? 'border-l-4 border-l-destructive bg-destructive/5' 
          : item.isCritico 
            ? 'border-l-4 border-l-warning bg-warning/5'
            : 'hover:border-primary/20'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div>
              <h4 className="font-semibold text-sm">{item.numeroProtocolo}</h4>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(item.prazo), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {getUrgencyBadge()}
            <Badge variant={getStatusColor(item.status)} className="text-xs">
              {item.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{item.clienteNome}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-3 w-3 text-muted-foreground" />
            <span>{item.veiculoPlaca}</span>
          </div>

          <div className="text-sm">
            <span className="font-medium text-primary">{item.servico}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-semibold text-success">
              R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs ${
              item.diasRestantes < 0 
                ? 'text-destructive font-medium' 
                : item.isCritico 
                  ? 'text-warning font-medium'
                  : 'text-muted-foreground'
            }`}>
              {item.diasRestantes < 0 
                ? `${Math.abs(item.diasRestantes)} dias em atraso`
                : item.diasRestantes === 0
                  ? 'Vence hoje'
                  : `${item.diasRestantes} dias restantes`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}