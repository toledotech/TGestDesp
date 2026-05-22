import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Store } from "lucide-react"
import type { RelatorioFiltros } from "@/hooks/useRelatorios"

interface LojaResumo {
  loja_id: string
  loja_nome: string
  loja_tipo: string
  quantidade: number
  valor_servicos: number
  valor_dut: number
  valor_boleto: number
  valor_total: number
  concluidos: number
  pendentes: number
}

interface ProcessosLojaTableProps {
  filtros: RelatorioFiltros
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const ProcessosLojaTable = ({ filtros }: ProcessosLojaTableProps) => {
  const { user } = useAuth()
  const [dados, setDados] = useState<LojaResumo[]>([])
  const [semLoja, setSemLoja] = useState<Omit<LojaResumo, 'loja_id' | 'loja_nome' | 'loja_tipo'> | null>(null)
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
          id, status, valor,
          valor_dut, valor_boleto,
          loja:lojas(id, nome, tipo)
        `)
        .eq('user_id', user!.id)
        .gte('created_at', filtros.data_inicio + 'T00:00:00')
        .lte('created_at', filtros.data_fim + 'T23:59:59')

      if (filtros.status_filtro === 'concluidos') query = query.eq('status', 'Concluído')
      else if (filtros.status_filtro === 'pendentes') query = query.neq('status', 'Concluído')
      if (filtros.servico_filtro !== 'todos') query = query.eq('servico', filtros.servico_filtro as any)

      const { data, error } = await query
      if (error) throw error

      // Agrupar por loja
      const mapa = new Map<string, LojaResumo>()
      let semLojaAcum = { quantidade: 0, valor_servicos: 0, valor_dut: 0, valor_boleto: 0, valor_total: 0, concluidos: 0, pendentes: 0 }

      for (const p of data || []) {
        const loja = (p as any).loja
        const vDut = Number(p.valor_dut ?? 0)
        const vBoleto = Number(p.valor_boleto ?? 0)
        const vServico = Number(p.valor ?? 0)
        const vTotal = vServico + vDut + vBoleto
        const concluido = p.status === 'Concluído'

        if (!loja) {
          semLojaAcum.quantidade++
          semLojaAcum.valor_servicos += vServico
          semLojaAcum.valor_dut += vDut
          semLojaAcum.valor_boleto += vBoleto
          semLojaAcum.valor_total += vTotal
          if (concluido) semLojaAcum.concluidos++
          else semLojaAcum.pendentes++
          continue
        }

        if (!mapa.has(loja.id)) {
          mapa.set(loja.id, {
            loja_id: loja.id,
            loja_nome: loja.nome,
            loja_tipo: loja.tipo,
            quantidade: 0,
            valor_servicos: 0,
            valor_dut: 0,
            valor_boleto: 0,
            valor_total: 0,
            concluidos: 0,
            pendentes: 0,
          })
        }

        const reg = mapa.get(loja.id)!
        reg.quantidade++
        reg.valor_servicos += vServico
        reg.valor_dut += vDut
        reg.valor_boleto += vBoleto
        reg.valor_total += vTotal
        if (concluido) reg.concluidos++
        else reg.pendentes++
      }

      const lista = Array.from(mapa.values()).sort((a, b) => b.valor_total - a.valor_total)
      setDados(lista)
      setSemLoja(semLojaAcum.quantidade > 0 ? semLojaAcum : null)
    } catch (err) {
      console.error('Erro ao buscar relatório por loja:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalGeral = {
    quantidade:      dados.reduce((s, r) => s + r.quantidade, 0)      + (semLoja?.quantidade ?? 0),
    valor_servicos:  dados.reduce((s, r) => s + r.valor_servicos, 0)  + (semLoja?.valor_servicos ?? 0),
    valor_dut:       dados.reduce((s, r) => s + r.valor_dut, 0)       + (semLoja?.valor_dut ?? 0),
    valor_boleto:    dados.reduce((s, r) => s + r.valor_boleto, 0)    + (semLoja?.valor_boleto ?? 0),
    valor_total:     dados.reduce((s, r) => s + r.valor_total, 0)     + (semLoja?.valor_total ?? 0),
    concluidos:      dados.reduce((s, r) => s + r.concluidos, 0)      + (semLoja?.concluidos ?? 0),
    pendentes:       dados.reduce((s, r) => s + r.pendentes, 0)       + (semLoja?.pendentes ?? 0),
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Relatório por Loja
        </CardTitle>
        <CardDescription>
          Faturamento de serviços, DUT e boletos agrupados por loja de origem no período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : dados.length === 0 && !semLoja ? (
          <div className="text-center py-12 text-muted-foreground">
            <Store className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum processo vinculado a lojas no período</p>
            <p className="text-sm mt-1">Vincule processos a lojas ao criar ou editar</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Loja</TableHead>
                  <TableHead className="text-center">Processos</TableHead>
                  <TableHead className="text-right">Serviços</TableHead>
                  <TableHead className="text-right">DUT</TableHead>
                  <TableHead className="text-right">Boleto</TableHead>
                  <TableHead className="text-right font-semibold">Total Geral</TableHead>
                  <TableHead className="text-center">Concluídos</TableHead>
                  <TableHead className="text-center">Pendentes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map(r => (
                  <TableRow key={r.loja_id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.loja_nome}</span>
                        <span className="text-xs text-muted-foreground">{r.loja_tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">{r.quantidade}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{fmt(r.valor_servicos)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {r.valor_dut > 0
                        ? <span className="text-amber-700">{fmt(r.valor_dut)}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {r.valor_boleto > 0
                        ? <span className="text-blue-700">{fmt(r.valor_boleto)}</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sm">{fmt(r.valor_total)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800 border-green-200">{r.concluidos}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{r.pendentes}</Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Processos sem loja */}
                {semLoja && (
                  <TableRow className="hover:bg-muted/40 italic">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-muted-foreground">Sem loja vinculada</span>
                        <span className="text-xs text-muted-foreground">Processos sem origem definida</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">{semLoja.quantidade}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(semLoja.valor_servicos)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {semLoja.valor_dut > 0 ? fmt(semLoja.valor_dut) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {semLoja.valor_boleto > 0 ? fmt(semLoja.valor_boleto) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">{fmt(semLoja.valor_total)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-green-100 text-green-800 border-green-200">{semLoja.concluidos}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{semLoja.pendentes}</Badge>
                    </TableCell>
                  </TableRow>
                )}

                {/* Linha de totais */}
                <TableRow className="bg-muted/60 font-semibold border-t-2">
                  <TableCell>TOTAL GERAL</TableCell>
                  <TableCell className="text-center">{totalGeral.quantidade}</TableCell>
                  <TableCell className="text-right font-mono">{fmt(totalGeral.valor_servicos)}</TableCell>
                  <TableCell className="text-right font-mono text-amber-700">{fmt(totalGeral.valor_dut)}</TableCell>
                  <TableCell className="text-right font-mono text-blue-700">{fmt(totalGeral.valor_boleto)}</TableCell>
                  <TableCell className="text-right font-mono text-primary">{fmt(totalGeral.valor_total)}</TableCell>
                  <TableCell className="text-center text-green-700">{totalGeral.concluidos}</TableCell>
                  <TableCell className="text-center text-yellow-700">{totalGeral.pendentes}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Legenda */}
        {!loading && (dados.length > 0 || semLoja) && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-amber-200 border border-amber-400" />
              DUT — Documento Único de Transferência pago ao DETRAN
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-blue-200 border border-blue-400" />
              Boleto — Taxa de boleto bancário
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
