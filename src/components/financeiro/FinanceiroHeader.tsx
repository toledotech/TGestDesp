import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Clock, CreditCard } from "lucide-react"
import { EstatisticasFinanceiras } from "@/hooks/useFinanceiro"

interface FinanceiroHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filtroTipo: 'all' | 'receita' | 'despesa'
  setFiltroTipo: (tipo: 'all' | 'receita' | 'despesa') => void
  filtroStatus: 'all' | 'pendente' | 'pago' | 'cancelado'
  setFiltroStatus: (status: 'all' | 'pendente' | 'pago' | 'cancelado') => void
  onNovaTransacao: () => void
  estatisticas: EstatisticasFinanceiras
}

export const FinanceiroHeader = ({ 
  searchTerm, 
  setSearchTerm,
  filtroTipo,
  setFiltroTipo,
  filtroStatus,
  setFiltroStatus,
  onNovaTransacao,
  estatisticas
}: FinanceiroHeaderProps) => {
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
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle suas receitas e despesas
          </p>
        </div>
        <Button onClick={onNovaTransacao}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(estatisticas.totalReceitas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(estatisticas.totalDespesas)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                estatisticas.saldoLiquido >= 0 
                  ? 'bg-green-500/10' 
                  : 'bg-red-500/10'
              }`}>
                <DollarSign className={`h-5 w-5 ${
                  estatisticas.saldoLiquido >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className={`text-xl font-bold ${
                  estatisticas.saldoLiquido >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(estatisticas.saldoLiquido)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatCurrency(estatisticas.receitasPendentes + estatisticas.despesasPendentes)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{estatisticas.transacoesMes}</p>
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
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="receita">Receitas</SelectItem>
            <SelectItem value="despesa">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}