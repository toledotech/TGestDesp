import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, parseISO, eachMonthOfInterval, eachWeekOfInterval, addWeeks, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface ProcessoPeriodo {
  periodo: string
  quantidade: number
  valor_total: number
  valor_medio: number
  processos_concluidos: number
  processos_pendentes: number
}

export interface ProcessoStatus {
  status: string
  quantidade: number
  porcentagem: number
  valor_total: number
  valor_medio: number
  cor: string
}

export interface ProcessoCliente {
  cliente: string
  quantidade: number
  valor_total: number
  valor_medio: number
  processos_concluidos: number
  processos_pendentes: number
  taxa_conclusao: number
}

export interface ProcessoServico {
  servico: string
  quantidade: number
  porcentagem: number
  valor_total: number
  valor_medio: number
}

export interface ControlePrazo {
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

export interface ReceitaDespesaPeriodo {
  periodo: string
  receitas: number
  despesas: number
  saldo: number
}

export interface FluxoCaixaPeriodo {
  periodo: string
  entradas: number
  saidas: number
  saldo_periodo: number
  saldo_acumulado: number
}

export interface RelatorioFiltros {
  data_inicio: string
  data_fim: string
  agrupamento: 'mensal' | 'semanal'
  status_filtro: 'todos' | 'concluidos' | 'pendentes'
  servico_filtro: string
}

export const useRelatorios = () => {
  const [processosPeriodo, setProcessosPeriodo] = useState<ProcessoPeriodo[]>([])
  const [processosStatus, setProcessosStatus] = useState<ProcessoStatus[]>([])
  const [processosCliente, setProcessosCliente] = useState<ProcessoCliente[]>([])
  const [processosServico, setProcessosServico] = useState<ProcessoServico[]>([])
  const [controlePrazos, setControlePrazos] = useState<ControlePrazo[]>([])
  const [receitasDespesas, setReceitasDespesas] = useState<ReceitaDespesaPeriodo[]>([])
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixaPeriodo[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<RelatorioFiltros>({
    data_inicio: format(addMonths(new Date(), -6), 'yyyy-MM-dd'),
    data_fim: format(new Date(), 'yyyy-MM-dd'),
    agrupamento: 'mensal',
    status_filtro: 'todos',
    servico_filtro: 'todos'
  })
  const { toast } = useToast()
  const { user } = useAuth()

  const fetchProcessosPeriodo = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      let query = supabase
        .from('processos')
        .select(`
          id,
          numero_protocolo,
          created_at,
          prazo,
          status,
          servico,
          valor,
          clientes!inner(nome)
        `)
        .eq('user_id', user.id)
        .gte('created_at', filtros.data_inicio + 'T00:00:00')
        .lte('created_at', filtros.data_fim + 'T23:59:59')

      // Aplicar filtro de status se necessário
      if (filtros.status_filtro === 'concluidos') {
        query = query.eq('status', 'Concluído')
      } else if (filtros.status_filtro === 'pendentes') {
        query = query.neq('status', 'Concluído')
      }

      // Aplicar filtro de serviço se necessário
      if (filtros.servico_filtro !== 'todos') {
        query = query.eq('servico', filtros.servico_filtro as any)
      }

      const { data, error } = await query.order('created_at', { ascending: true })

      if (error) {
        console.error('Erro ao buscar processos:', error)
        toast({
          title: "Erro ao carregar relatório",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Agrupar dados por período
      const dadosAgrupados = agruparPorPeriodo(data || [], filtros.agrupamento)
      setProcessosPeriodo(dadosAgrupados)

      // Agrupar dados por status
      const dadosStatus = agruparPorStatus(data || [])
      setProcessosStatus(dadosStatus)

      // Agrupar dados por cliente
      const dadosCliente = agruparPorCliente(data || [])
      setProcessosCliente(dadosCliente)

      // Agrupar dados por serviço
      const dadosServico = agruparPorServico(data || [])
      setProcessosServico(dadosServico)

      // Agrupar dados por prazos
      const dadosPrazos = agruparPorPrazo(data || [])
      setControlePrazos(dadosPrazos)

      // Buscar dados financeiros
      await fetchDadosFinanceiros()
      await fetchFluxoCaixa()
    } catch (error: any) {
      console.error('Erro inesperado:', error)
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar o relatório.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const agruparPorPeriodo = (processos: any[], agrupamento: 'mensal' | 'semanal'): ProcessoPeriodo[] => {
    const grupos = new Map<string, any[]>()
    
    // Criar todos os períodos no intervalo selecionado
    const dataInicio = parseISO(filtros.data_inicio)
    const dataFim = parseISO(filtros.data_fim)
    
    let periodos: Date[]
    if (agrupamento === 'mensal') {
      periodos = eachMonthOfInterval({ start: dataInicio, end: dataFim })
    } else {
      periodos = eachWeekOfInterval({ start: dataInicio, end: dataFim }, { weekStartsOn: 1 })
    }

    // Inicializar todos os períodos com arrays vazios
    periodos.forEach(periodo => {
      const chave = agrupamento === 'mensal' 
        ? format(periodo, 'yyyy-MM', { locale: ptBR })
        : format(periodo, 'yyyy-\'W\'ww', { locale: ptBR })
      grupos.set(chave, [])
    })

    // Agrupar processos existentes
    processos.forEach(processo => {
      const dataProcesso = parseISO(processo.created_at)
      let chave: string
      
      if (agrupamento === 'mensal') {
        chave = format(dataProcesso, 'yyyy-MM', { locale: ptBR })
      } else {
        chave = format(dataProcesso, 'yyyy-\'W\'ww', { locale: ptBR })
      }
      
      if (!grupos.has(chave)) {
        grupos.set(chave, [])
      }
      grupos.get(chave)!.push(processo)
    })

    // Converter para array de ProcessoPeriodo
    return Array.from(grupos.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, processosGrupo]) => {
        const quantidade = processosGrupo.length
        const valor_total = processosGrupo.reduce((acc, p) => acc + Number(p.valor), 0)
        const valor_medio = quantidade > 0 ? valor_total / quantidade : 0
        const processos_concluidos = processosGrupo.filter(p => p.status === 'Concluído').length
        const processos_pendentes = quantidade - processos_concluidos

        // Formatar label do período
        let periodoFormatado: string
        if (agrupamento === 'mensal') {
          const [ano, mes] = periodo.split('-')
          periodoFormatado = format(new Date(parseInt(ano), parseInt(mes) - 1), 'MMM/yyyy', { locale: ptBR })
        } else {
          const [ano, semana] = periodo.split('-W')
          periodoFormatado = `Sem ${semana}/${ano}`
        }

        return {
          periodo: periodoFormatado,
          quantidade,
          valor_total,
          valor_medio,
          processos_concluidos,
          processos_pendentes,
        }
      })
  }

  const agruparPorStatus = (processos: any[]): ProcessoStatus[] => {
    const grupos = new Map<string, any[]>()
    
    // Agrupar processos por status
    processos.forEach(processo => {
      const status = processo.status
      if (!grupos.has(status)) {
        grupos.set(status, [])
      }
      grupos.get(status)!.push(processo)
    })

    const total = processos.length
    
    // Converter para array de ProcessoStatus
    return Array.from(grupos.entries())
      .map(([status, processosGrupo]) => {
        const quantidade = processosGrupo.length
        const valor_total = processosGrupo.reduce((acc, p) => acc + Number(p.valor), 0)
        const valor_medio = quantidade > 0 ? valor_total / quantidade : 0
        const porcentagem = total > 0 ? (quantidade / total) * 100 : 0
        
        return {
          status,
          quantidade,
          porcentagem,
          valor_total,
          valor_medio,
          cor: getStatusColor(status),
        }
      })
      .sort((a, b) => b.quantidade - a.quantidade)
  }

  const getStatusColor = (status: string): string => {
    // Cores mapeadas para os valores reais do enum processo_status no banco
    const cores: Record<string, string> = {
      'Recebido': '#3b82f6',          // azul
      'Em Conferência': '#f59e0b',    // amarelo
      'No DETRAN': '#8b5cf6',         // roxo
      'Aguardando Pagamento': '#ef4444', // vermelho
      'Concluído': '#10b981',         // verde
    }
    return cores[status] ?? '#6b7280'
  }

  const agruparPorCliente = (processos: any[]): ProcessoCliente[] => {
    const grupos = new Map<string, any[]>()
    
    // Agrupar processos por cliente
    processos.forEach(processo => {
      const nomeCliente = processo.clientes?.nome || 'Cliente não informado'
      if (!grupos.has(nomeCliente)) {
        grupos.set(nomeCliente, [])
      }
      grupos.get(nomeCliente)!.push(processo)
    })
    
    // Converter para array de ProcessoCliente
    return Array.from(grupos.entries())
      .map(([cliente, processosGrupo]) => {
        const quantidade = processosGrupo.length
        const valor_total = processosGrupo.reduce((acc, p) => acc + Number(p.valor), 0)
        const valor_medio = quantidade > 0 ? valor_total / quantidade : 0
        const processos_concluidos = processosGrupo.filter(p => p.status === 'Concluído').length
        const processos_pendentes = quantidade - processos_concluidos
        const taxa_conclusao = quantidade > 0 ? (processos_concluidos / quantidade) * 100 : 0
        
        return {
          cliente,
          quantidade,
          valor_total,
          valor_medio,
          processos_concluidos,
          processos_pendentes,
          taxa_conclusao,
        }
      })
      .sort((a, b) => b.quantidade - a.quantidade) // Ordenar por quantidade (maior primeiro)
  }

  const agruparPorServico = (processos: any[]): ProcessoServico[] => {
    const grupos = new Map<string, any[]>()
    
    // Agrupar processos por serviço
    processos.forEach(processo => {
      const servico = processo.servico || 'Outros'
      if (!grupos.has(servico)) {
        grupos.set(servico, [])
      }
      grupos.get(servico)!.push(processo)
    })

    const total = processos.length
    
    // Converter para array de ProcessoServico
    return Array.from(grupos.entries())
      .map(([servico, processosGrupo]) => {
        const quantidade = processosGrupo.length
        const valor_total = processosGrupo.reduce((acc, p) => acc + Number(p.valor), 0)
        const valor_medio = quantidade > 0 ? valor_total / quantidade : 0
        const porcentagem = total > 0 ? (quantidade / total) * 100 : 0
        
        return {
          servico,
          quantidade,
          porcentagem,
          valor_total,
          valor_medio,
        }
      })
      .sort((a, b) => b.quantidade - a.quantidade) // Ordenar por quantidade (maior primeiro)
  }

  const agruparPorPrazo = (processos: any[]): ControlePrazo[] => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const vencidos: any[] = []
    const venceHoje: any[] = []
    const proximos7: any[] = []
    const proximos15: any[] = []
    const proximos30: any[] = []

    processos.forEach(processo => {
      if (!processo.prazo) return
      
      const prazoDate = new Date(processo.prazo)
      prazoDate.setHours(0, 0, 0, 0)
      
      const diffTime = prazoDate.getTime() - hoje.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const processoFormatado = {
        id: processo.id,
        numero_protocolo: processo.numero_protocolo,
        cliente_nome: processo.clientes?.nome || 'Cliente não identificado',
        servico: processo.servico,
        prazo: processo.prazo,
        dias_restantes: diffDays,
      }

      if (diffDays < 0) {
        vencidos.push(processoFormatado)
      } else if (diffDays === 0) {
        venceHoje.push(processoFormatado)
      } else if (diffDays <= 7) {
        proximos7.push(processoFormatado)
      } else if (diffDays <= 15) {
        proximos15.push(processoFormatado)
      } else if (diffDays <= 30) {
        proximos30.push(processoFormatado)
      }
    })

    return [
      { categoria: 'Vencidos', quantidade: vencidos.length, processos: vencidos },
      { categoria: 'Hoje', quantidade: venceHoje.length, processos: venceHoje },
      { categoria: 'Próximos 7 dias', quantidade: proximos7.length, processos: proximos7 },
      { categoria: 'Próximos 15 dias', quantidade: proximos15.length, processos: proximos15 },
      { categoria: 'Próximos 30 dias', quantidade: proximos30.length, processos: proximos30 },
    ].filter(item => item.quantidade > 0)
  }

  const fetchDadosFinanceiros = async () => {
    if (!user) return

    try {
      const { data: transacoes, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_transacao', filtros.data_inicio)
        .lte('data_transacao', filtros.data_fim)

      if (error) {
        console.error('Erro ao buscar transações financeiras:', error)
        return
      }

      // Agrupar por período
      const dadosFinanceiros = agruparTransacoesPorPeriodo(transacoes || [])
      setReceitasDespesas(dadosFinanceiros)
    } catch (error) {
      console.error('Erro ao processar dados financeiros:', error)
    }
  }

  const agruparTransacoesPorPeriodo = (transacoes: any[]): ReceitaDespesaPeriodo[] => {
    const grupos = new Map<string, { receitas: number; despesas: number }>()
    
    // Criar todos os períodos no intervalo selecionado
    const dataInicio = parseISO(filtros.data_inicio)
    const dataFim = parseISO(filtros.data_fim)
    
    let periodos: Date[]
    if (filtros.agrupamento === 'mensal') {
      periodos = eachMonthOfInterval({ start: dataInicio, end: dataFim })
    } else {
      periodos = eachWeekOfInterval({ start: dataInicio, end: dataFim }, { weekStartsOn: 1 })
    }

    // Inicializar todos os períodos
    periodos.forEach(periodo => {
      const chave = filtros.agrupamento === 'mensal' 
        ? format(periodo, 'yyyy-MM', { locale: ptBR })
        : format(periodo, 'yyyy-\'W\'ww', { locale: ptBR })
      grupos.set(chave, { receitas: 0, despesas: 0 })
    })

    // Agrupar transações por período
    transacoes.forEach(transacao => {
      const dataTransacao = parseISO(transacao.data_transacao)
      let chave: string
      
      if (filtros.agrupamento === 'mensal') {
        chave = format(dataTransacao, 'yyyy-MM', { locale: ptBR })
      } else {
        chave = format(dataTransacao, 'yyyy-\'W\'ww', { locale: ptBR })
      }
      
      if (!grupos.has(chave)) {
        grupos.set(chave, { receitas: 0, despesas: 0 })
      }
      
      const grupo = grupos.get(chave)!
      const valor = Number(transacao.valor)
      
      if (transacao.tipo === 'receita') {
        grupo.receitas += valor
      } else {
        grupo.despesas += valor
      }
    })

    // Converter para array
    return Array.from(grupos.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, dados]) => {
        // Formatar label do período
        let periodoFormatado: string
        if (filtros.agrupamento === 'mensal') {
          const [ano, mes] = periodo.split('-')
          periodoFormatado = format(new Date(parseInt(ano), parseInt(mes) - 1), 'MMM/yyyy', { locale: ptBR })
        } else {
          const [ano, semana] = periodo.split('-W')
          periodoFormatado = `Sem ${semana}/${ano}`
        }

        return {
          periodo: periodoFormatado,
          receitas: dados.receitas,
          despesas: dados.despesas,
          saldo: dados.receitas - dados.despesas,
        }
      })
  }

  const fetchFluxoCaixa = async () => {
    if (!user) return

    try {
      const { data: transacoes, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pago') // Apenas transações pagas para fluxo de caixa real
        .gte('data_transacao', filtros.data_inicio)
        .lte('data_transacao', filtros.data_fim)

      if (error) {
        console.error('Erro ao buscar dados do fluxo de caixa:', error)
        return
      }

      // Agrupar por período com saldo acumulado
      const dadosFluxo = agruparFluxoCaixaPorPeriodo(transacoes || [])
      setFluxoCaixa(dadosFluxo)
    } catch (error) {
      console.error('Erro ao processar fluxo de caixa:', error)
    }
  }

  const agruparFluxoCaixaPorPeriodo = (transacoes: any[]): FluxoCaixaPeriodo[] => {
    const grupos = new Map<string, { entradas: number; saidas: number }>()
    
    // Criar todos os períodos no intervalo selecionado
    const dataInicio = parseISO(filtros.data_inicio)
    const dataFim = parseISO(filtros.data_fim)
    
    let periodos: Date[]
    if (filtros.agrupamento === 'mensal') {
      periodos = eachMonthOfInterval({ start: dataInicio, end: dataFim })
    } else {
      periodos = eachWeekOfInterval({ start: dataInicio, end: dataFim }, { weekStartsOn: 1 })
    }

    // Inicializar todos os períodos
    periodos.forEach(periodo => {
      const chave = filtros.agrupamento === 'mensal' 
        ? format(periodo, 'yyyy-MM', { locale: ptBR })
        : format(periodo, 'yyyy-\'W\'ww', { locale: ptBR })
      grupos.set(chave, { entradas: 0, saidas: 0 })
    })

    // Agrupar transações por período
    transacoes.forEach(transacao => {
      const dataTransacao = parseISO(transacao.data_transacao)
      let chave: string
      
      if (filtros.agrupamento === 'mensal') {
        chave = format(dataTransacao, 'yyyy-MM', { locale: ptBR })
      } else {
        chave = format(dataTransacao, 'yyyy-\'W\'ww', { locale: ptBR })
      }
      
      if (!grupos.has(chave)) {
        grupos.set(chave, { entradas: 0, saidas: 0 })
      }
      
      const grupo = grupos.get(chave)!
      const valor = Number(transacao.valor)
      
      if (transacao.tipo === 'receita') {
        grupo.entradas += valor
      } else {
        grupo.saidas += valor
      }
    })

    // Converter para array e calcular saldo acumulado
    let saldoAcumulado = 0
    
    return Array.from(grupos.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, dados]) => {
        const saldoPeriodo = dados.entradas - dados.saidas
        saldoAcumulado += saldoPeriodo

        // Formatar label do período
        let periodoFormatado: string
        if (filtros.agrupamento === 'mensal') {
          const [ano, mes] = periodo.split('-')
          periodoFormatado = format(new Date(parseInt(ano), parseInt(mes) - 1), 'MMM/yyyy', { locale: ptBR })
        } else {
          const [ano, semana] = periodo.split('-W')
          periodoFormatado = `Sem ${semana}/${ano}`
        }

        return {
          periodo: periodoFormatado,
          entradas: dados.entradas,
          saidas: dados.saidas,
          saldo_periodo: saldoPeriodo,
          saldo_acumulado: saldoAcumulado,
        }
      })
  }

  const estatisticasResumo = useMemo(() => {
    const totalProcessos = processosPeriodo.reduce((acc, p) => acc + p.quantidade, 0)
    const valorTotal = processosPeriodo.reduce((acc, p) => acc + p.valor_total, 0)
    const totalConcluidos = processosPeriodo.reduce((acc, p) => acc + p.processos_concluidos, 0)
    const totalPendentes = processosPeriodo.reduce((acc, p) => acc + p.processos_pendentes, 0)
    
    const mediaPorPeriodo = totalProcessos / Math.max(processosPeriodo.length, 1)
    const valorMedio = totalProcessos > 0 ? valorTotal / totalProcessos : 0
    const taxaConclusao = totalProcessos > 0 ? (totalConcluidos / totalProcessos) * 100 : 0

    return {
      totalProcessos,
      valorTotal,
      totalConcluidos,
      totalPendentes,
      mediaPorPeriodo,
      valorMedio,
      taxaConclusao,
    }
  }, [processosPeriodo])

  const updateFiltros = (novosFiltros: Partial<RelatorioFiltros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }))
  }

  useEffect(() => {
    fetchProcessosPeriodo()
  }, [user, filtros])

  return {
    processosPeriodo,
    processosStatus,
    processosCliente,
    processosServico,
    controlePrazos,
    receitasDespesas,
    fluxoCaixa,
    estatisticasResumo,
    loading,
    filtros,
    updateFiltros,
    refetch: fetchProcessosPeriodo,
  }
}