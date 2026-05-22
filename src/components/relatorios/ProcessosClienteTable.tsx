import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProcessoCliente } from "./ProcessosClienteChart"
import { Progress } from "@/components/ui/progress"

interface ProcessosClienteTableProps {
  data: ProcessoCliente[]
}

export const ProcessosClienteTable = ({ data }: ProcessosClienteTableProps) => {
  const getTaxaBadgeVariant = (taxa: number) => {
    if (taxa >= 80) return "default" // Verde para alta taxa
    if (taxa >= 60) return "secondary" // Amarelo para taxa média
    return "destructive" // Vermelho para taxa baixa
  }

  const getVolumeBadgeVariant = (quantidade: number) => {
    const maxQuantidade = Math.max(...data.map(d => d.quantidade))
    const percentual = (quantidade / maxQuantidade) * 100
    
    if (percentual >= 70) return "default" // Verde para alto volume
    if (percentual >= 40) return "secondary" // Amarelo para volume médio
    return "outline" // Cinza para volume baixo
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento por Cliente</CardTitle>
        <CardDescription>
          Histórico completo e análise de performance por cliente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Qtd. Processos</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Valor Médio</TableHead>
                <TableHead className="text-center">Concluídos</TableHead>
                <TableHead className="text-center">Pendentes</TableHead>
                <TableHead className="text-center">Taxa Conclusão</TableHead>
                <TableHead className="text-center">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum dado encontrado para o período selecionado
                  </TableCell>
                </TableRow>
              ) : (
                data.map((cliente, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{cliente.cliente}</span>
                        <Badge 
                          variant={getVolumeBadgeVariant(cliente.quantidade)}
                          className="w-fit mt-1 text-xs"
                        >
                          {cliente.quantidade > 10 ? 'Alto Volume' : 
                           cliente.quantidade > 5 ? 'Médio Volume' : 'Baixo Volume'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {cliente.quantidade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      R$ {cliente.valor_total.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      R$ {cliente.valor_medio.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {cliente.processos_concluidos}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        {cliente.processos_pendentes}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Badge variant={getTaxaBadgeVariant(cliente.taxa_conclusao)}>
                          {cliente.taxa_conclusao.toFixed(1)}%
                        </Badge>
                        <Progress 
                          value={cliente.taxa_conclusao} 
                          className="w-16 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col space-y-1">
                        <div className="text-xs text-muted-foreground">
                          Ticket Médio: 
                          <span className="font-mono ml-1">
                            R$ {cliente.valor_medio.toFixed(0)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Eficiência: 
                          <span className={`font-semibold ml-1 ${
                            cliente.taxa_conclusao >= 80 ? 'text-green-600' :
                            cliente.taxa_conclusao >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {cliente.taxa_conclusao >= 80 ? 'Excelente' :
                             cliente.taxa_conclusao >= 60 ? 'Boa' : 'Baixa'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              <span>Total de clientes: <strong>{data.length}</strong></span>
              <span>
                Processos totais: <strong>
                  {data.reduce((acc, cliente) => acc + cliente.quantidade, 0)}
                </strong>
              </span>
              <span>
                Receita total: <strong>
                  R$ {data.reduce((acc, cliente) => acc + cliente.valor_total, 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <span>
                Taxa média de conclusão: <strong>
                  {(data.reduce((acc, cliente) => acc + cliente.taxa_conclusao, 0) / data.length).toFixed(1)}%
                </strong>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}