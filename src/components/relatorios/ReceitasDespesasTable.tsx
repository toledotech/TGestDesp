import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ReceitaDespesaPeriodo {
  periodo: string
  receitas: number
  despesas: number
  saldo: number
}

interface ReceitasDespesasTableProps {
  data: ReceitaDespesaPeriodo[]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const getSaldoVariant = (saldo: number) => {
  if (saldo > 0) return 'default'
  if (saldo < 0) return 'destructive'
  return 'secondary'
}

const getSaldoIcon = (saldo: number) => {
  if (saldo > 0) return <TrendingUp className="h-3 w-3" />
  if (saldo < 0) return <TrendingDown className="h-3 w-3" />
  return <Minus className="h-3 w-3" />
}

export const ReceitasDespesasTable = ({ data }: ReceitasDespesasTableProps) => {
  const totais = data.reduce(
    (acc, item) => ({
      receitas: acc.receitas + item.receitas,
      despesas: acc.despesas + item.despesas,
      saldo: acc.saldo + item.saldo,
    }),
    { receitas: 0, despesas: 0, saldo: 0 }
  )

  const mediaPorPeriodo = data.length > 0 ? {
    receitas: totais.receitas / data.length,
    despesas: totais.despesas / data.length,
    saldo: totais.saldo / data.length,
  } : { receitas: 0, despesas: 0, saldo: 0 }

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Receitas</CardDescription>
            <CardTitle className="text-success text-2xl">
              {formatCurrency(totais.receitas)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Média: {formatCurrency(mediaPorPeriodo.receitas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Despesas</CardDescription>
            <CardTitle className="text-destructive text-2xl">
              {formatCurrency(totais.despesas)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Média: {formatCurrency(mediaPorPeriodo.despesas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saldo Líquido</CardDescription>
            <CardTitle className={`text-2xl ${totais.saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(totais.saldo)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Média: {formatCurrency(mediaPorPeriodo.saldo)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Período</CardTitle>
          <CardDescription>
            Análise detalhada das receitas e despesas por período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Despesas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.periodo}
                    </TableCell>
                    <TableCell className="text-right text-success font-medium">
                      {formatCurrency(item.receitas)}
                    </TableCell>
                    <TableCell className="text-right text-destructive font-medium">
                      {formatCurrency(item.despesas)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      item.saldo >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {formatCurrency(item.saldo)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getSaldoVariant(item.saldo)} className="gap-1">
                        {getSaldoIcon(item.saldo)}
                        {item.saldo > 0 ? 'Positivo' : item.saldo < 0 ? 'Negativo' : 'Neutro'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Linha de Totais */}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell className="font-bold">Total Geral</TableCell>
                  <TableCell className="text-right text-success font-bold">
                    {formatCurrency(totais.receitas)}
                  </TableCell>
                  <TableCell className="text-right text-destructive font-bold">
                    {formatCurrency(totais.despesas)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${
                    totais.saldo >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {formatCurrency(totais.saldo)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getSaldoVariant(totais.saldo)} className="gap-1">
                      {getSaldoIcon(totais.saldo)}
                      {totais.saldo > 0 ? 'Lucro' : totais.saldo < 0 ? 'Prejuízo' : 'Equilibrado'}
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