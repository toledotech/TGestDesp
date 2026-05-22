import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Calendar, User, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ControlePrazo {
  categoria: string
  quantidade: number
  processos: Array<{
    id: string
    numero_protocolo: string
    cliente_nome: string
    servico: string
    prazo: string
    dias_restantes: number
  }>
}

interface ControlePrazosTableProps {
  data: ControlePrazo[]
}

export const ControlePrazosTable = ({ data }: ControlePrazosTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDiasRestantesVariant = (dias: number) => {
    if (dias < 0) return "destructive"
    if (dias === 0) return "secondary"
    if (dias <= 7) return "outline"
    return "default"
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'Vencidos':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'Hoje':
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Vencidos':
        return 'bg-red-50 border-red-200'
      case 'Hoje':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  // Separar dados por categoria para as abas
  const vencidos = data.find(item => item.categoria === 'Vencidos')?.processos || []
  const hoje = data.find(item => item.categoria === 'Hoje')?.processos || []
  const proximos = data.filter(item => 
    item.categoria.startsWith('Próximos')
  ).flatMap(item => item.processos)

  const totalProcessos = data.reduce((sum, item) => sum + item.quantidade, 0)
  const totalVencidos = vencidos.length
  const totalHoje = hoje.length
  const totalProximos = proximos.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Processos por Status de Prazo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Lista detalhada de todos os processos organizados por urgência
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-600">{totalVencidos}</p>
                <p className="text-xs text-muted-foreground">Vencidos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
                <Clock className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-600">{totalHoje}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{totalProximos}</p>
                <p className="text-xs text-muted-foreground">Próximos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50 border">
                <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-2xl font-bold">{totalProcessos}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>

            {/* Tabelas por Categoria */}
            <Tabs defaultValue="vencidos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vencidos" className="text-red-600">
                  Vencidos ({totalVencidos})
                </TabsTrigger>
                <TabsTrigger value="hoje" className="text-orange-600">
                  Hoje ({totalHoje})
                </TabsTrigger>
                <TabsTrigger value="proximos" className="text-blue-600">
                  Próximos ({totalProximos})
                </TabsTrigger>
              </TabsList>

              {/* Processos Vencidos */}
              <TabsContent value="vencidos" className="space-y-4">
                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Processos Vencidos - Ação Imediata Necessária
                  </h3>
                  {vencidos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      🎉 Parabéns! Nenhum processo vencido
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Protocolo</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead className="text-center">Dias em Atraso</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vencidos.map((processo) => (
                          <TableRow key={processo.id} className="border-red-200">
                            <TableCell className="font-mono font-medium">
                              {processo.numero_protocolo}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {processo.cliente_nome}
                            </TableCell>
                            <TableCell>{processo.servico}</TableCell>
                            <TableCell className="font-mono">
                              {formatDate(processo.prazo)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="destructive" className="font-mono">
                                {Math.abs(processo.dias_restantes)} dias
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="destructive">
                                VENCIDO
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              {/* Processos Hoje */}
              <TabsContent value="hoje" className="space-y-4">
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                  <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Processos com Prazo Hoje - Atenção Urgente
                  </h3>
                  {hoje.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum processo com prazo hoje
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Protocolo</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hoje.map((processo) => (
                          <TableRow key={processo.id} className="border-orange-200">
                            <TableCell className="font-mono font-medium">
                              {processo.numero_protocolo}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {processo.cliente_nome}
                            </TableCell>
                            <TableCell>{processo.servico}</TableCell>
                            <TableCell className="font-mono">
                              {formatDate(processo.prazo)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                VENCE HOJE
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              {/* Próximos Processos */}
              <TabsContent value="proximos" className="space-y-4">
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Próximos Processos - Planejamento
                  </h3>
                  {proximos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum processo com prazo próximo
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Protocolo</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead className="text-center">Dias Restantes</TableHead>
                          <TableHead className="text-center">Urgência</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proximos
                          .sort((a, b) => a.dias_restantes - b.dias_restantes)
                          .map((processo) => (
                          <TableRow key={processo.id} className="border-blue-200">
                            <TableCell className="font-mono font-medium">
                              {processo.numero_protocolo}
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {processo.cliente_nome}
                            </TableCell>
                            <TableCell>{processo.servico}</TableCell>
                            <TableCell className="font-mono">
                              {formatDate(processo.prazo)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={getDiasRestantesVariant(processo.dias_restantes)}
                                className="font-mono"
                              >
                                {processo.dias_restantes} dias
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={processo.dias_restantes <= 7 ? "secondary" : "outline"}
                              >
                                {processo.dias_restantes <= 7 ? "ALTA" : "NORMAL"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}