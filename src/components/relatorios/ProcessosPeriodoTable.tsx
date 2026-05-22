import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProcessoPeriodo } from "@/hooks/useRelatorios"

interface ProcessosPeriodoTableProps {
  data: ProcessoPeriodo[]
}

export const ProcessosPeriodoTable = ({ data }: ProcessosPeriodoTableProps) => {
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

  const getPerformanceBadge = (concluidos: number, total: number) => {
    if (total === 0) return <Badge variant="secondary">N/A</Badge>
    
    const percentual = (concluidos / total) * 100
    
    if (percentual >= 90) {
      return <Badge className="bg-green-500/10 text-green-700 border-green-200">Excelente</Badge>
    } else if (percentual >= 70) {
      return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200">Bom</Badge>
    } else if (percentual >= 50) {
      return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">Regular</Badge>
    } else {
      return <Badge className="bg-red-500/10 text-red-700 border-red-200">Baixo</Badge>
    }
  }

  // Calcular totais
  const totais = data.reduce(
    (acc, item) => ({
      quantidade: acc.quantidade + item.quantidade,
      valor_total: acc.valor_total + item.valor_total,
      processos_concluidos: acc.processos_concluidos + item.processos_concluidos,
      processos_pendentes: acc.processos_pendentes + item.processos_pendentes,
    }),
    { quantidade: 0, valor_total: 0, processos_concluidos: 0, processos_pendentes: 0 }
  )

  const valorMedioGeral = totais.quantidade > 0 ? totais.valor_total / totais.quantidade : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento por Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Valor Médio</TableHead>
                <TableHead className="text-center">Concluídos</TableHead>
                <TableHead className="text-center">Pendentes</TableHead>
                <TableHead className="text-center">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.periodo}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{item.quantidade}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.valor_total)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(item.valor_medio)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-500/10 text-green-700 border-green-200">
                      {item.processos_concluidos}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
                      {item.processos_pendentes}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getPerformanceBadge(item.processos_concluidos, item.quantidade)}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Linha de totais */}
              {data.length > 0 && (
                <TableRow className="border-t-2 font-bold bg-muted/50">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{totais.quantidade}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totais.valor_total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(valorMedioGeral)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-500/10 text-green-700 border-green-200">
                      {totais.processos_concluidos}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-orange-500/10 text-orange-700 border-orange-200">
                      {totais.processos_pendentes}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {getPerformanceBadge(totais.processos_concluidos, totais.quantidade)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado encontrado para o período selecionado.
          </div>
        )}
      </CardContent>
    </Card>
  )
}