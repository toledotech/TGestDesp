import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

// ─── Configuração centralizada dos limites por plano ─────────────────────────
// Toda regra de negócio de limites vive aqui — um único lugar para ajustar.

/** Máximo de processos por mês por plano (null = ilimitado) */
export const PLANO_LIMITE_PROCESSOS: Record<string, number | null> = {
  'Freemium':   25,
  'Básico':     50,
  'Premium':    200,
  'Enterprise': null,
  'ETERNAL':    null,
}

/** Planos que têm acesso ao relatório Fluxo de Caixa */
const PLANO_FLUXO_CAIXA: Record<string, boolean> = {
  'Freemium':   false,
  'Básico':     true,
  'Premium':    true,
  'Enterprise': true,
  'ETERNAL':    true,
}

/** Planos que têm acesso ao relatório Receitas vs Despesas */
const PLANO_RECEITAS_DESPESAS: Record<string, boolean> = {
  'Freemium':   false,
  'Básico':     false,
  'Premium':    true,
  'Enterprise': true,
  'ETERNAL':    true,
}

// Tier desconhecido/futuro → acesso total (evita bloquear sem querer)
const getPlanoLimite = (tier: string): number | null =>
  Object.prototype.hasOwnProperty.call(PLANO_LIMITE_PROCESSOS, tier)
    ? PLANO_LIMITE_PROCESSOS[tier]
    : null

const getFluxoCaixa = (tier: string): boolean =>
  PLANO_FLUXO_CAIXA[tier] ?? true

const getReceitasDespesas = (tier: string): boolean =>
  PLANO_RECEITAS_DESPESAS[tier] ?? true

// ─── Interface ────────────────────────────────────────────────────────────────

export interface PlanLimits {
  /** Tier atual do usuário (ex: 'Freemium', 'Básico', 'ETERNAL') */
  tier: string
  /** True apenas quando o usuário está no plano gratuito Freemium */
  isFreemium: boolean
  /** Máximo de processos por mês (null = ilimitado) */
  processosMes: number | null
  /** Quantos processos o usuário criou no mês atual */
  processosUsados: number
  /** processosMes - processosUsados (null quando ilimitado) */
  processosRestantes: number | null
  /** Acesso à aba Fluxo de Caixa nos relatórios (Básico+) */
  relatoriosFluxoCaixa: boolean
  /** Acesso à aba Receitas vs Despesas nos relatórios (Premium+) */
  relatoriosReceitasDespesas: boolean
  /** Se o usuário ainda pode criar novos processos este mês */
  podeCriarProcesso: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const usePlanLimits = () => {
  const { user } = useAuth()
  const [limits, setLimits] = useState<PlanLimits>({
    tier: 'Freemium',
    isFreemium: true,
    processosMes: 25,
    processosUsados: 0,
    processosRestantes: 25,
    relatoriosFluxoCaixa: false,
    relatoriosReceitasDespesas: false,
    podeCriarProcesso: true,
  })
  const [loading, setLoading] = useState(true)

  const fetchLimits = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // 1. Buscar tier do usuário na tabela subscribers
      const { data: sub } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('email', user.email ?? '')
        .maybeSingle()

      const tier = sub?.subscription_tier ?? 'Freemium'
      const isFreemium = tier === 'Freemium'
      const processosMes = getPlanoLimite(tier)

      // 2. Contar processos do mês apenas quando há limite definido
      let processosUsados = 0
      if (processosMes !== null) {
        const { data: count } = await supabase
          .rpc('count_processos_mes', { target_user_id: user.id })
        processosUsados = count ?? 0
      }

      const processosRestantes = processosMes !== null
        ? Math.max(0, processosMes - processosUsados)
        : null

      setLimits({
        tier,
        isFreemium,
        processosMes,
        processosUsados,
        processosRestantes,
        relatoriosFluxoCaixa: getFluxoCaixa(tier),
        relatoriosReceitasDespesas: getReceitasDespesas(tier),
        podeCriarProcesso: processosMes === null || processosUsados < processosMes,
      })
    } catch (error) {
      console.error('usePlanLimits: erro ao buscar limites:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLimits()
  }, [user])

  return { limits, loading, refetch: fetchLimits }
}
