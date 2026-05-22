import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

interface FluxoCaixaPeriodo {
  periodo: string
  entradas: number
  saidas: number
  saldo_periodo: number
  saldo_acumulado: number
}

interface FluxoCaixaTableProps {
  data: FluxoCaixaPeriodo[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const getSaldoIcon = (saldo: number) => {
  if (saldo > 0) return <ArrowUpRight className="h-3 w-3" />
  if (saldo < 0) return <ArrowDownRight className="h-3 w-3" />
  return <Minus className="h-3 w-3" />
}

const getSaldoVariant = (saldo: number) => {
  if (saldo > 0) return 'default'
  if (saldo < 0) return 'destructive'
  return 'secondary'
}

const getTendenciaIcon = (atual: number, anterior: number) => {
  if (atual > anterior) return <TrendingUp className="h-3 w-3 text-success" />
  if (atual < anterior) return <TrendingDown className="h-3 w-3 text-destructive" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

export const FluxoCaixaTable = ({ data }: FluxoCaixaTableProps) => {
  const totais = data.reduce(
    (acc, item) => ({
      entradas: acc.entradas + item.entradas,
      saidas: acc.saidas + item.saidas,
    }),
    { entradas: 0, saidas: 0 }
  )

  const saldoFinal = data.length > 0 ? data[data.length - 1].saldo_acumulado : 0
  const mediaMensal = data.length > 0 ? {
    entradas: totais.entradas / data.length,
    saidas: totais.saidas / data.length,
  } : { entradas: 0, saidas: 0 }

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Total de Entradas
            </CardDescription>
            <CardTitle className="text-success text-xl">
              {formatCurrency(totais.entradas)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Média: {formatCurrency(mediaMensal.entradas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Total de Saídas
            </CardDescription>
            <CardTitle className="text-destructive text-xl">
              {formatCurrency(totais.saidas)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Média: {formatCurrency(mediaMensal.saidas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo Líquido</CardDescription>
            <CardTitle className={`text-xl ${(totais.entradas - totais.saidas) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(totais.entradas - totais.saidas)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Total do período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo Acumulado</CardDescription>
            <CardTitle className={`text-xl ${saldoFinal >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(saldoFinal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Posição atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento do Fluxo de Caixa</CardTitle>
          <CardDescription>
            Análise período a período das movimentações financeiras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Entradas</TableHead>
                  <TableHead className="text-right">Saídas</TableHead>
                  <TableHead className="text-right">Saldo do Período</TableHead>
                  <TableHead className="text-right">Saldo Acumulado</TableHead>
                  <TableHead className="text-center">Tendência</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => {
                  const saldoAnterior = index > 0 ? data[index - 1].saldo_acumulado : 0
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.periodo}
                      </TableCell>
                      <TableCell className="text-right text-success font-medium">
                        {formatCurrency(item.entradas)}
                      </TableCell>
                      <TableCell className="text-right text-destructive font-medium">
                        {formatCurrency(item.saidas)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        item.saldo_periodo >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {formatCurrency(item.saldo_periodo)}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        item.saldo_acumulado >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {formatCurrency(item.saldo_acumulado)}
                      </TableCell>
                      <TableCell className="text-center">
                        {index > 0 && getTendenciaIcon(item.saldo_acumulado, saldoAnterior)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getSaldoVariant(item.saldo_acumulado)} className="gap-1">
                          {getSaldoIcon(item.saldo_acumulado)}
                          {item.saldo_acumulado > 0 ? 'Positivo' : item.saldo_acumulado < 0 ? 'Negativo' : 'Neutro'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                
                {/* Linha de Totais */}
                <TableRow className="bg-muted/50 font-medium border-t-2">
                  <TableCell className="font-bold">Total Geral</TableCell>
                  <TableCell className="text-right text-success font-bold">
                    {formatCurrency(totais.entradas)}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-bold">
                    {formatCurrency(totais.saidas)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${
                    (totais.entradas - totais.saidas) >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {formatCurrency(totais.entradas - totais.saidas)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${
                    saldoFinal >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {formatCurrency(saldoFinal)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">Final</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getSaldoVariant(saldoFinal)} className="gap-1">
                      {getSaldoIcon(saldoFinal)}
                      {saldoFinal > 0 ? 'Superávit' : saldoFinal < 0 ? 'Déficit' : 'Equilibrado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}