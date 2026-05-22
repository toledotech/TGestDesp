import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react"
import { RelatorioFiltros } from "@/hooks/useRelatorios"

interface RelatoriosHeaderProps {
  filtros: RelatorioFiltros
  onUpdateFiltros: (filtros: Partial<RelatorioFiltros>) => void
  estatisticas: {
    totalProcessos: number
    valorTotal: number
    totalConcluidos: number
    totalPendentes: number
    mediaPorPeriodo: number
    valorMedio: number
    taxaConclusao: number
  }
  onExport?: () => void
}

export const RelatoriosHeader = ({ 
  filtros, 
  onUpdateFiltros, 
  estatisticas,
  onExport
}: RelatoriosHeaderProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number, decimals = 1) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Processos por Período - Análise de quantidade e valores
          </p>
        </div>
        {onExport && (
          <Button onClick={onExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        )}
      </div>

      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Processos</p>
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
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(estatisticas.valorTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média por Período</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatNumber(estatisticas.mediaPorPeriodo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatNumber(estatisticas.taxaConclusao)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Label htmlFor="data_inicio">Data Início</Label>
          <Input
            id="data_inicio"
            type="date"
            value={filtros.data_inicio}
            onChange={(e) => onUpdateFiltros({ data_inicio: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="data_fim">Data Fim</Label>
          <Input
            id="data_fim"
            type="date"
            value={filtros.data_fim}
            onChange={(e) => onUpdateFiltros({ data_fim: e.target.value })}
          />
        </div>

        <div>
          <Label>Agrupamento</Label>
          <Select 
            value={filtros.agrupamento} 
            onValueChange={(value: 'mensal' | 'semanal') => onUpdateFiltros({ agrupamento: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="semanal">Semanal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select 
            value={filtros.status_filtro} 
            onValueChange={(value: any) => onUpdateFiltros({ status_filtro: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="concluidos">Concluídos</SelectItem>
              <SelectItem value="pendentes">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Serviço</Label>
          <Select 
            value={filtros.servico_filtro} 
            onValueChange={(value) => onUpdateFiltros({ servico_filtro: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Transferência de Propriedade">Transferência</SelectItem>
              <SelectItem value="Licenciamento Anual">Licenciamento</SelectItem>
              <SelectItem value="2ª Via CRV">2ª Via CRV</SelectItem>
              <SelectItem value="Comunicação de Venda">Comunicação</SelectItem>
              <SelectItem value="IPVA">IPVA</SelectItem>
              <SelectItem value="Multas">Multas</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}