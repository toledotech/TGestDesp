import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./useAuth"
import { useToast } from "./use-toast"
import { differenceInDays, format, isBefore, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"

export interface Notification {
  id: string
  type: 'warning' | 'info' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
  data?: any
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()
  // Rastreia IDs de processos já notificados para evitar duplicatas entre re-renders
  const notifiedProcessosRef = useRef<Set<string>>(new Set())
  // Evita mostrar a notificação de agenda mais de uma vez por sessão
  const agendaNotificadaRef = useRef(false)

  // Marcar notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // Remover notificação
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  // Adicionar nova notificação
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Mostrar toast para notificações importantes
    if (notification.type === 'warning' || notification.type === 'error') {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      })
    }
  }, [toast])

  // Verificar prazos próximos
  const checkPrazosProximos = useCallback(async () => {
    if (!user) return

    try {
      const { data: processos, error } = await supabase
        .from('processos')
        .select('id, numero_protocolo, servico, prazo, status')
        .eq('user_id', user.id)
        .in('status', ['Recebido', 'Em Conferência', 'No DETRAN', 'Aguardando Pagamento'])
        .not('prazo', 'is', null)

      if (error) throw error

      const hoje = new Date()
      const processosComPrazo = processos || []

      processosComPrazo.forEach(processo => {
        if (!processo.prazo) return

        // Evita notificações duplicadas para o mesmo processo
        if (notifiedProcessosRef.current.has(processo.id)) return

        const prazoFinal = new Date(processo.prazo)
        const diasRestantes = differenceInDays(prazoFinal, hoje)

        // Notificações por urgência
        if (isBefore(prazoFinal, hoje)) {
          notifiedProcessosRef.current.add(processo.id)
          addNotification({
            type: 'error',
            title: '⚠️ Prazo Vencido',
            message: `Processo ${processo.numero_protocolo} venceu em ${format(prazoFinal, "dd/MM/yyyy", { locale: ptBR })}`,
            data: { processoId: processo.id },
            action: {
              label: 'Ver Processo',
              onClick: () => window.location.href = '/processos'
            }
          })
        } else if (diasRestantes <= 1) {
          notifiedProcessosRef.current.add(processo.id)
          addNotification({
            type: 'warning',
            title: '🚨 Prazo Crítico',
            message: `Processo ${processo.numero_protocolo} vence ${diasRestantes === 0 ? 'hoje' : 'amanhã'}`,
            data: { processoId: processo.id },
            action: {
              label: 'Ver Processo',
              onClick: () => window.location.href = '/processos'
            }
          })
        } else if (diasRestantes <= 7) {
          notifiedProcessosRef.current.add(processo.id)
          addNotification({
            type: 'warning',
            title: '⏰ Prazo Próximo',
            message: `Processo ${processo.numero_protocolo} vence em ${diasRestantes} dias`,
            data: { processoId: processo.id },
            action: {
              label: 'Ver Processo',
              onClick: () => window.location.href = '/processos'
            }
          })
        }
      })

    } catch (error) {
      console.error('Erro ao verificar prazos:', error)
    }
  }, [user, addNotification])

  // Verificar agenda do dia
  const checkAgendaHoje = useCallback(async () => {
    if (!user) return

    try {
      const hoje = new Date()
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59)

      const { data: processos, error } = await supabase
        .from('processos')
        .select('id, numero_protocolo, servico, prazo, status')
        .eq('user_id', user.id)
        .gte('prazo', inicioDia.toISOString())
        .lte('prazo', fimDia.toISOString())
        .in('status', ['Recebido', 'Em Conferência', 'No DETRAN', 'Aguardando Pagamento'])
        .order('prazo', { ascending: true })

      if (error) throw error

      if (processos && processos.length > 0 && !agendaNotificadaRef.current) {
        agendaNotificadaRef.current = true
        addNotification({
          type: 'info',
          title: '📅 Processos com Prazo Hoje',
          message: `Você tem ${processos.length} processo(s) com prazo para hoje`,
          data: { processos },
          action: {
            label: 'Ver Prazos',
            onClick: () => window.location.href = '/prazos'
          }
        })
      }

    } catch (error) {
      console.error('Erro ao verificar agenda:', error)
    }
  }, [user, addNotification])

  // Configurar listeners em tempo real
  useEffect(() => {
    if (!user) return

    // Listener para novos processos
    const processosChannel = supabase
      .channel('processos-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'processos',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const processo = payload.new as any
          addNotification({
            type: 'success',
            title: '✅ Novo Processo',
            message: `Processo ${processo.numero_protocolo} foi criado com sucesso`,
            data: { processoId: processo.id },
            action: {
              label: 'Ver Processo',
              onClick: () => window.location.href = '/processos'
            }
          })
        }
      )
      .subscribe()

    // Listener para transações financeiras
    const financeiroChannel = supabase
      .channel('financeiro-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transacoes_financeiras',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const transacao = payload.new as any
          if (transacao.valor >= 1000) { // Notificar apenas transações altas
            addNotification({
              type: 'info',
              title: transacao.tipo === 'receita' ? '💰 Nova Receita' : '💸 Nova Despesa',
              message: `${transacao.tipo === 'receita' ? 'Receita' : 'Despesa'} de R$ ${transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              data: { transacaoId: transacao.id },
              action: {
                label: 'Ver Financeiro',
                onClick: () => window.location.href = '/financeiro'
              }
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(processosChannel)
      supabase.removeChannel(financeiroChannel)
    }
  }, [user, addNotification])

  // Verificar notificações iniciais
  useEffect(() => {
    if (!user) return

    const verificarNotificacoes = async () => {
      await checkPrazosProximos()
      await checkAgendaHoje()
    }

    verificarNotificacoes()

    // Verificar novamente a cada 30 minutos
    const interval = setInterval(verificarNotificacoes, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user, checkPrazosProximos, checkAgendaHoje])

  // Atualizar contador de não lidas
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  }
}