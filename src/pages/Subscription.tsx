import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans"
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus"

const Subscription = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e escolha o plano ideal para seu escritório.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubscriptionStatus />
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Planos Disponíveis</CardTitle>
              <CardDescription>
                Escolha o plano que melhor atende às necessidades do seu escritório.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionPlans />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Subscription