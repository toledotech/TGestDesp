import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ProcessoStatus {
  status: string
  quantidade: number
  porcentagem: number
  valor_total: number
  valor_medio: number
  cor: string
}

interface ProcessosStatusTableProps {
  data: ProcessoStatus[]
}

export const ProcessosStatusTable = ({ data }: ProcessosStatusTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'default'
      case 'Em Andamento':
        return 'secondary'
      case 'Aguardando Documentos':
        return 'destructive'
      case 'Recebido':
        return 'outline'
      case 'Cancelado':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'hsl(142, 76%, 36%)'
      case 'Em Andamento':
        return 'hsl(38, 92%, 50%)'
      case 'Aguardando Documentos':
        return 'hsl(0, 84%, 60%)'
      case 'Recebido':
        return 'hsl(217, 91%, 60%)'
      case 'Cancelado':
        return 'hsl(215, 13%, 44%)'
      default:
        return 'hsl(215, 13%, 44%)'
    }
  }

  const totalProcessos = data.reduce((acc, item) => acc + item.quantidade, 0)
  const totalValor = data.reduce((acc, item) => acc + item.valor_total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Detalhamento por Status</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Nenhum dado encontrado para o período selecionado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalProcessos}</p>
                <p className="text-sm text-muted-foreground">Total de Processos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValor)}</p>
                <p className="text-sm text-muted-foreground">Valor Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {totalProcessos > 0 ? formatCurrency(totalValor / totalProcessos) : 'R$ 0,00'}
                </p>
                <p className="text-sm text-muted-foreground">Valor Médio</p>
              </div>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Distribuição</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Valor Médio</TableHead>
                    <TableHead className="text-center">% do Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data
                    .sort((a, b) => b.quantidade - a.quantidade) // Ordenar por quantidade (maior primeiro)
                    .map((item, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {item.quantidade}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={item.porcentagem} 
                            className="flex-1 h-2"
                            style={{ 
                              '--progress-foreground': getStatusColor(item.status) 
                            } as React.CSSProperties}
                          />
                          <span className="text-sm font-medium min-w-[45px]">
                            {item.porcentagem.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.valor_total)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.valor_medio)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          />
                          <span className="font-medium">
                            {((item.quantidade / totalProcessos) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}