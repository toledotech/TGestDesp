import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, AlertTriangle, Clock, Calendar, CheckCircle } from "lucide-react"
import { EstatisticasPrazos } from "@/hooks/usePrazos"

interface PrazosHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filtroStatus: 'all' | 'vencido' | 'hoje' | 'proximo' | 'normal'
  setFiltroStatus: (status: 'all' | 'vencido' | 'hoje' | 'proximo' | 'normal') => void
  filtroProcesso: 'all' | 'Recebido' | 'Em Conferência' | 'No DETRAN' | 'Aguardando Pagamento' | 'Concluído'
  setFiltroProcesso: (status: 'all' | 'Recebido' | 'Em Conferência' | 'No DETRAN' | 'Aguardando Pagamento' | 'Concluído') => void
  estatisticas: EstatisticasPrazos
}

export const PrazosHeader = ({ 
  searchTerm, 
  setSearchTerm,
  filtroStatus,
  setFiltroStatus,
  filtroProcesso,
  setFiltroProcesso,
  estatisticas
}: PrazosHeaderProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prazos</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie os prazos dos processos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ativos</p>
                <p className="text-xl font-bold text-blue-600">
                  {estatisticas.totalProcessos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-xl font-bold text-red-600">
                  {estatisticas.prazosVencidos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-xl font-bold text-orange-600">
                  {estatisticas.prazosHoje}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos</p>
                <p className="text-xl font-bold text-yellow-600">
                  {estatisticas.prazosProximos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Crítico</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(estatisticas.valorVencidos + estatisticas.valorHoje)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, protocolo, serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status do Prazo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os prazos</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
            <SelectItem value="hoje">Vence hoje</SelectItem>
            <SelectItem value="proximo">Próximos (7 dias)</SelectItem>
            <SelectItem value="normal">Normais</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroProcesso} onValueChange={(value: any) => setFiltroProcesso(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status do Processo" />
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