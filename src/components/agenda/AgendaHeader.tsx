import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Grid, List, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import { AgendaStats } from "@/hooks/useAgenda"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AgendaHeaderProps {
  stats: AgendaStats
  viewMode: 'month' | 'week' | 'day'
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  selectedDate: Date
  loading: boolean
}

export function AgendaHeader({ 
  stats, 
  viewMode, 
  onViewModeChange, 
  statusFilter, 
  onStatusFilterChange, 
  selectedDate,
  loading 
}: AgendaHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Título e Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Agenda
          </h1>
          <p className="text-muted-foreground">
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {stats.totalPrazos} prazos
          </Badge>
          
          {stats.prazosVencidos > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {stats.prazosVencidos} vencidos
            </Badge>
          )}
          
          {stats.prazosCriticos > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-warning/20 text-warning">
              <AlertTriangle className="h-3 w-3" />
              {stats.prazosCriticos} críticos
            </Badge>
          )}
          
          {stats.prazosHoje > 0 && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {stats.prazosHoje} hoje
            </Badge>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('month')}
            disabled={loading}
          >
            <Grid className="h-4 w-4 mr-1" />
            Mês
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('week')}
            disabled={loading}
          >
            <List className="h-4 w-4 mr-1" />
            Semana
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('day')}
            disabled={loading}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Dia
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Recebido">Recebido</SelectItem>
            <SelectItem value="Em Conferência">Em Conferência</SelectItem>
            <SelectItem value="No DETRAN">No DETRAN</SelectItem>
            <SelectItem value="Aguardando Pagamento">Aguardando Pagamento</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}