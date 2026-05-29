import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ListOrdered } from "lucide-react"
import type { RelatorioFiltros } from "@/hooks/useRelatorios"

interface ProcessoDetalhado {
  id: string
  created_at: string
  data_abertura?: string
  cliente_nome: string
  veiculo_marca: string
  veiculo_modelo: string
  veiculo_placa: string
  servico: string
  status: string
  credito: number
  a_receber: number
  valor_total: number
}

interface RelatorioDetalhadoTableProps {
  filtros: RelatorioFiltros
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtData = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR')

export const RelatorioDetalhadoTable = ({ filtros }: RelatorioDetalhadoTableProps) => {
  const { user } = useAuth()
  const [dados, setDados] = useState<ProcessoDetalhado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchDados()
  }, [user, filtros.data_inicio, filtros.data_fim, filtros.status_filtro, filtros.servico_filtro])

  const fetchDados = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('processos')
        .select(`
          id, created_at, data_abertura, servico, status, valor,
          cliente:clientes(nome),
          veiculo:veiculos(marca, modelo, placa)
        `)
        .eq('user_id', user!.id)
        .gte('created_at', filtros.data_inicio + 'T00:00:00')
        .lte('created_at', filtros.data_fim + 'T23:59:59')
        .order('created_at', { ascending: false })

      if (filtros.status_filtro === 'concluidos') query = query.eq('status', 'Concluído')
      else if (filtros.status_filtro === 'pendentes') query = query.neq('status', 'Concluído')
      if (filtros.servico_filtro !== 'todos') query = query.eq('servico', filtros.servico_filtro as any)

      const { data, error } = await query
      if (error) throw error

      // Buscar créditos de lojas vinculados a cada processo via transações financeiras
      const processosIds = (data || []).map(p => p.id)
      let creditosMap: Record<string, number> = {}

      if (processosIds.length > 0) {
        const { data: transacoes } = await supabase
          .from('transacoes_financeiras')
          .select('processo_id, tipo, valor')
          .eq('user_id', user!.id)
          .in('processo_id', processosIds)

        for (const t of transacoes || []) {
          if (!t.processo_id) continue
          if (t.tipo === 'despesa') {
            creditosMap[t.processo_id] = (creditosMap[t.processo_id] || 0) + Number(t.valor)
          }
        }
      }

      const lista: ProcessoDetalhado[] = (data || []).map(p => {
        const cliente = (p as any).cliente
        const veiculo = (p as any).veiculo
        const valor = Number(p.valor ?? 0)
        const credito = creditosMap[p.id] || 0
        return {
          id: p.id,
          created_at: p.created_at,
          data_abertura: p.data_abertura ?? undefined,
          cliente_nome: cliente?.nome ?? '—',
          veiculo_marca: veiculo?.marca ?? '',
          veiculo_modelo: veiculo?.modelo ?? '',
          veiculo_placa: veiculo?.placa ?? '—',
          servico: p.servico,
          status: p.status,
          credito,
          a_receber: Math.max(valor - credito, 0),
          valor_total: valor,
        }
      })

      setDados(lista)
    } catch (err) {
      console.error('Erro ao buscar relatório detalhado:', err)
    } finally {
      setLoading(false)
    }
  }

  const totais = dados.reduce(
    (acc, p) => ({
      credito: acc.credito + p.credito,
      a_receber: acc.a_receber + p.a_receber,
      valor_total: acc.valor_total + p.valor_total,
    }),
    { credito: 0, a_receber: 0, valor_total: 0 }
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5" />
          Relatório Detalhado de Honorários
        </CardTitle>
        <CardDescription>
          Listagem individual de processos no período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : dados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ListOrdered className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum processo encontrado no período</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-center w-8">#</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Crédito</TableHead>
                  <TableHead className="text-right">A Receber</TableHead>
                  <TableHead className="text-right font-semibold">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((p, idx) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="text-center text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {fmtData(p.data_abertura || p.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{p.cliente_nome}</TableCell>
                    <TableCell className="text-sm">
                      {p.veiculo_marca} {p.veiculo_modelo}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {p.veiculo_placa}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{p.servico}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {p.credito > 0
                        ? <span className="text-red-600">- {fmt(p.credito)}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {p.a_receber > 0
                        ? <span className="text-green-700">{fmt(p.a_receber)}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sm">
                      {fmt(p.valor_total)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Totais */}
                <TableRow className="bg-muted/60 font-semibold border-t-2">
                  <TableCell colSpan={6} className="text-right pr-4">
                    TOTAL ({dados.length} processos)
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    {totais.credito > 0 ? `- ${fmt(totais.credito)}` : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-green-700">
                    {fmt(totais.a_receber)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-primary">
                    {fmt(totais.valor_total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
