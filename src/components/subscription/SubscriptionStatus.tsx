import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CreditCard, Crown, RefreshCw } from "lucide-react"
import { useSubscription } from "@/hooks/useSubscription"
import { usePlanLimits } from "@/hooks/usePlanLimits"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const SubscriptionStatus = () => {
  const { subscriptionStatus, checkSubscription, openCustomerPortal, loading, stripeDisponivel } = useSubscription()
  const { limits } = usePlanLimits()

  const formatDate = (dateString: string) =>
    format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })

  const isEternal = subscriptionStatus.subscription_tier === 'ETERNAL'

  // Usuário tem assinatura local (ex.: ETERNAL, Freemium) mesmo sem Stripe ativo
  const hasLocalSubscription = !stripeDisponivel && subscriptionStatus.subscribed

  // Percentual de uso para Freemium
  const usagePct = limits.processosMes
    ? Math.min(100, (limits.processosUsados / limits.processosMes) * 100)
    : 0

  return (
    <Card className={isEternal ? 'border-amber-300 bg-amber-50/30' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isEternal
                ? <Crown className="h-5 w-5 text-amber-500" />
                : <CreditCard className="h-5 w-5" />
              }
              Status da Assinatura
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura e plano atual
            </CardDescription>
          </div>
          {(stripeDisponivel || isEternal) && (
            <Button
              variant="outline"
              size="sm"
              onClick={checkSubscription}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {isEternal ? (
            <Badge className="bg-amber-500 border-0 text-white gap-1">
              <Crown className="h-3 w-3" />
              ETERNAL
            </Badge>
          ) : hasLocalSubscription ? (
            <Badge variant="default">Ativa</Badge>
          ) : stripeDisponivel ? (
            <Badge variant={subscriptionStatus.subscribed ? "default" : "secondary"}>
              {subscriptionStatus.subscribed ? "Ativa" : "Inativa"}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Não configurado
            </Badge>
          )}
        </div>

        {/* Plano */}
        {subscriptionStatus.subscription_tier && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plano:</span>
            {isEternal ? (
              <Badge className="bg-amber-500 border-0 text-white gap-1">
                <Crown className="h-3 w-3" />
                ETERNAL
              </Badge>
            ) : (
              <Badge variant="outline">{subscriptionStatus.subscription_tier}</Badge>
            )}
          </div>
        )}

        {/* Data de renovação (não exibida para ETERNAL) */}
        {!isEternal && subscriptionStatus.subscription_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Renovação:</span>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              {formatDate(subscriptionStatus.subscription_end)}
            </div>
          </div>
        )}

        {/* Barra de uso: planos com limite (Freemium, Básico, Premium) */}
        {limits.processosMes !== null && !isEternal && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Processos este mês</span>
              <span className={limits.processosRestantes === 0 ? 'text-red-600 font-semibold' : 'font-medium'}>
                {limits.processosUsados} / {limits.processosMes}
              </span>
            </div>
            <Progress
              value={usagePct}
              className={`h-2 ${usagePct >= 100 ? '[&>div]:bg-red-500' : usagePct >= 80 ? '[&>div]:bg-amber-500' : ''}`}
            />
            {limits.processosRestantes === 0 && (
              <p className="text-xs text-red-600">
                Limite atingido. Faça upgrade para criar mais processos.
              </p>
            )}
            {limits.processosRestantes !== null && limits.processosRestantes > 0 && limits.processosRestantes <= 5 && (
              <p className="text-xs text-amber-600">
                Atenção: restam apenas {limits.processosRestantes} processo{limits.processosRestantes !== 1 ? 's' : ''} este mês.
              </p>
            )}
          </div>
        )}

        {/* Mensagem para ETERNAL */}
        {isEternal && (
          <p className="text-xs text-amber-700 text-center pt-1">
            Você possui acesso completo e ilimitado sem data de expiração.
          </p>
        )}

        {/* Mensagem quando Stripe não configurado e sem plano local */}
        {!stripeDisponivel && !hasLocalSubscription && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Configure o Stripe para ativar a cobrança de assinaturas.
          </p>
        )}

        {/* Botão gerenciar (só para assinantes Stripe ativos) */}
        {stripeDisponivel && subscriptionStatus.subscribed && !isEternal && (
          <Button
            className="w-full"
            variant="outline"
            onClick={openCustomerPortal}
            disabled={loading}
          >
            Gerenciar Assinatura
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
