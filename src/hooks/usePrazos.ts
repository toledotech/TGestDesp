import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export interface ProcessoPrazo {
  id: string
  numero_protocolo: string
  servico: string
  status: string
  valor: number
  prazo: string
  observacoes?: string
  created_at: string
  cliente_nome: string
  cliente_telefone?: string
  veiculo_info: string
  dias_restantes: number
  status_prazo: 'vencido' | 'hoje' | 'proximo' | 'normal'
}

export interface EstatisticasPrazos {
  totalProcessos: number
  prazosVencidos: number
  prazosHoje: number
  prazosProximos: number
  valorVencidos: number
  valorHoje: number
}

export const usePrazos = () => {
  const [processos, setProcessos] = useState<ProcessoPrazo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'vencido' | 'hoje' | 'proximo' | 'normal'>('all')
  const [filtroProcesso, setFiltroProcesso] = useState<'all' | 'Recebido' | 'Em Conferência' | 'No DETRAN' | 'Aguardando Pagamento' | 'Concluído'>('all')
  const { toast } = useToast()
  const { user } = useAuth()

  const calcularStatusPrazo = (prazo: string): { dias_restantes: number; status_prazo: 'vencido' | 'hoje' | 'proximo' | 'normal' } => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    const dataPrazo = new Date(prazo)
    dataPrazo.setHours(0, 0, 0, 0)
    
    const diffTime = dataPrazo.getTime() - hoje.getTime()
    const dias_restantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    let status_prazo: 'vencido' | 'hoje' | 'proximo' | 'normal'
    
    if (dias_restantes < 0) {
      status_prazo = 'vencido'
    } else if (dias_restantes === 0) {
      status_prazo = 'hoje'
    } else if (dias_restantes <= 7) {
      status_prazo = 'proximo'
    } else {
      status_prazo = 'normal'
    }
    
    return { dias_restantes, status_prazo }
  }

  const fetchProcessos = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('processos')
        .select(`
          id,
          numero_protocolo,
          servico,
          status,
          valor,
          prazo,
          observacoes,
          created_at,
          clientes!inner(nome, telefone),
          veiculos!inner(marca, modelo, placa)
        `)
        .eq('user_id', user.id)
        .order('prazo', { ascending: true })

      if (error) {
        console.error('Erro ao buscar processos:', error)
        toast({
          title: "Erro ao carregar prazos",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      const processosComPrazo = (data || []).map((processo: any) => {
        const { dias_restantes, status_prazo } = calcularStatusPrazo(processo.prazo)
        
        return {
          ...processo,
          cliente_nome: processo.clientes.nome,
          cliente_telefone: processo.clientes.telefone,
          veiculo_info: `${processo.veiculos.marca} ${processo.veiculos.modelo} - ${processo.veiculos.placa}`,
          dias_restantes,
          status_prazo,
        } as ProcessoPrazo
      })

      setProcessos(processosComPrazo)
    } catch (error: any) {
      console.error('Erro inesperado:', error)
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os prazos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const atualizarPrazo = async (id: string, novoPrazo: string) => {
    if (!user) return { error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('processos')
        .update({ prazo: novoPrazo })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao atualizar prazo:', error)
        toast({
          title: "Erro ao atualizar prazo",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      toast({
        title: "Prazo atualizado",
        description: "Prazo atualizado com sucesso!",
      })
      
      await fetchProcessos()
      return { error: null }
    } catch (error: any) {
      console.error('Erro inesperado:', error)
      toast({
        title: "Erro inesperado",
        description: "Não foi possível atualizar o prazo.",
        variant: "destructive",
      })
      return { error }
    }
  }

  const estatisticas = useMemo((): EstatisticasPrazos => {
    const processosAtivos = processos.filter(p => p.status !== 'Concluído')
    
    const prazosVencidos = processosAtivos.filter(p => p.status_prazo === 'vencido')
    const prazosHoje = processosAtivos.filter(p => p.status_prazo === 'hoje')
    const prazosProximos = processosAtivos.filter(p => p.status_prazo === 'proximo')

    const valorVencidos = prazosVencidos.reduce((acc, p) => acc + Number(p.valor), 0)
    const valorHoje = prazosHoje.reduce((acc, p) => acc + Number(p.valor), 0)

    return {
      totalProcessos: processosAtivos.length,
      prazosVencidos: prazosVencidos.length,
      prazosHoje: prazosHoje.length,
      prazosProximos: prazosProximos.length,
      valorVencidos,
      valorHoje,
    }
  }, [processos])

  const processosFiltrados = useMemo(() => {
    return processos.filter(processo => {
      const matchesSearch = 
        processo.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.numero_protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        processo.veiculo_info.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatusPrazo = filtroStatus === 'all' || processo.status_prazo === filtroStatus
      const matchesStatusProcesso = filtroProcesso === 'all' || processo.status === filtroProcesso

      return matchesSearch && matchesStatusPrazo && matchesStatusProcesso
    })
  }, [processos, searchTerm, filtroStatus, filtroProcesso])

  useEffect(() => {
    fetchProcessos()
  }, [user])

  return {
    processos: processosFiltrados,
    estatisticas,
    loading,
    searchTerm,
    setSearchTerm,
    filtroStatus,
    setFiltroStatus,
    filtroProcesso,
    setFiltroProcesso,
    atualizarPrazo,
    refetch: fetchProcessos,
  }
}