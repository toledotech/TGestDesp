import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ProcessoServico {
  servico: string
  quantidade: number
  porcentagem: number
  valor_total: number
  valor_medio: number
}

interface ProcessosServicoTableProps {
  data: ProcessoServico[]
}

export const ProcessosServicoTable = ({ data }: ProcessosServicoTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const getVolumeVariant = (quantidade: number, maxQuantidade: number) => {
    const percentage = (quantidade / maxQuantidade) * 100
    if (percentage >= 80) return "default"
    if (percentage >= 50) return "secondary"
    return "outline"
  }

  const getServicoColor = (servico: string) => {
    const colors = {
      'Transferência': 'hsl(217, 91%, 60%)',
      'Licenciamento': 'hsl(142, 76%, 36%)',
      'IPVA': 'hsl(32, 95%, 44%)',
      'Multas': 'hsl(0, 84%, 60%)',
      'CNH': 'hsl(262, 83%, 58%)',
      'Outros': 'hsl(215, 14%, 34%)'
    }
    return colors[servico as keyof typeof colors] || colors['Outros']
  }

  // Calcular totais
  const totais = data.reduce(
    (acc, item) => ({
      quantidade: acc.quantidade + item.quantidade,
      valor_total: acc.valor_total + item.valor_total,
    }),
    { quantidade: 0, valor_total: 0 }
  )

  const maxQuantidade = Math.max(...data.map(item => item.quantidade))

  // Ordenar por quantidade (decrescente)
  const dadosOrdenados = [...data].sort((a, b) => b.quantidade - a.quantidade)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento por Tipo de Serviço</CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise detalhada da demanda e valores por tipo de serviço
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum dado encontrado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(totais.quantidade)}</p>
                <p className="text-sm text-muted-foreground">Total de Processos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totais.valor_total)}</p>
                <p className="text-sm text-muted-foreground">Receita Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{data.length}</p>
                <p className="text-sm text-muted-foreground">Tipos de Serviço</p>
              </div>
            </div>

            {/* Tabela Detalhada */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-center">Distribuição</TableHead>
                  <TableHead className="text-center">Valor Total</TableHead>
                  <TableHead className="text-center">Valor Médio</TableHead>
                  <TableHead className="text-center">% do Total</TableHead>
                  <TableHead className="text-center">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosOrdenados.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getServicoColor(item.servico) }}
                        />
                        <span className="font-medium">{item.servico}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {formatNumber(item.quantidade)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <Progress 
                          value={item.porcentagem} 
                          className="h-2"
                          style={{
                            backgroundColor: `${getServicoColor(item.servico)}20`
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.porcentagem.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-green-700">
                      {formatCurrency(item.valor_total)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-blue-700">
                      {formatCurrency(item.valor_medio)}
                    </TableCell>
                    <TableCell className="text-center">
                      {((item.valor_total / totais.valor_total) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={getVolumeVariant(item.quantidade, maxQuantidade)}
                        className="font-mono"
                      >
                        {index === 0 ? "Alto" : index === 1 ? "Médio" : "Baixo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Resumo Final */}
            {data.length > 0 && (
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{formatNumber(totais.quantidade)}</p>
                    <p className="text-xs text-muted-foreground">Total de Processos</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(totais.valor_total)}</p>
                    <p className="text-xs text-muted-foreground">Receita Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(totais.valor_total / totais.quantidade)}
                    </p>
                    <p className="text-xs text-muted-foreground">Valor Médio Geral</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      {dadosOrdenados[0]?.servico || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">Serviço Mais Demandado</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}