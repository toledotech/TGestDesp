import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Clock, Calendar, User, Car, FileText, Edit2, Save, X } from "lucide-react"
import { ProcessoPrazo } from "@/hooks/usePrazos"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PrazoCardProps {
  processo: ProcessoPrazo
  onUpdatePrazo: (id: string, novoPrazo: string) => Promise<{ error: any } | { error: null }>
}

export const PrazoCard = ({ processo, onUpdatePrazo }: PrazoCardProps) => {
  const [editandoPrazo, setEditandoPrazo] = useState(false)
  const [novoPrazo, setNovoPrazo] = useState(processo.prazo)
  const [salvando, setSalvando] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusPrazoColor = (status: string) => {
    switch (status) {
      case 'vencido': return 'bg-red-500/10 text-red-700 border-red-200'
      case 'hoje': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'proximo': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'normal': return 'bg-green-500/10 text-green-700 border-green-200'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getStatusPrazoText = (status: string, dias: number) => {
    switch (status) {
      case 'vencido': return `Vencido há ${Math.abs(dias)} dia(s)`
      case 'hoje': return 'Vence hoje'
      case 'proximo': return `${dias} dia(s) restantes`
      case 'normal': return `${dias} dia(s) restantes`
      default: return 'Indefinido'
    }
  }

  const getStatusProcessoColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'No DETRAN': return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'Aguardando Pagamento': return 'bg-orange-500/10 text-orange-700 border-orange-200'
      case 'Em Conferência': return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'Recebido': return 'bg-gray-500/10 text-gray-700 border-gray-200'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getIconePrazo = (status: string) => {
    switch (status) {
      case 'vencido': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'hoje': return <Clock className="h-5 w-5 text-orange-600" />
      case 'proximo': return <Calendar className="h-5 w-5 text-yellow-600" />
      case 'normal': return <Calendar className="h-5 w-5 text-green-600" />
      default: return <Calendar className="h-5 w-5 text-gray-600" />
    }
  }

  const handleSalvarPrazo = async () => {
    setSalvando(true)
    try {
      const result = await onUpdatePrazo(processo.id, novoPrazo)
      if (!result.error) {
        setEditandoPrazo(false)
      }
    } catch (error) {
      console.error('Erro ao salvar prazo:', error)
    } finally {
      setSalvando(false)
    }
  }

  const handleCancelar = () => {
    setNovoPrazo(processo.prazo)
    setEditandoPrazo(false)
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              processo.status_prazo === 'vencido' ? 'bg-red-500/10' :
              processo.status_prazo === 'hoje' ? 'bg-orange-500/10' :
              processo.status_prazo === 'proximo' ? 'bg-yellow-500/10' :
              'bg-green-500/10'
            }`}>
              {getIconePrazo(processo.status_prazo)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{processo.numero_protocolo}</h3>
              <p className="text-sm text-muted-foreground">{processo.servico}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusProcessoColor(processo.status)}>
              {processo.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{processo.cliente_nome}</span>
            {processo.cliente_telefone && (
              <span className="text-muted-foreground">• {processo.cliente_telefone}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>{processo.veiculo_info}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Prazo:</span>
          </div>
          
          {editandoPrazo ? (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={novoPrazo}
                onChange={(e) => setNovoPrazo(e.target.value)}
                className="h-8 w-32 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSalvarPrazo}
                disabled={salvando}
                className="h-8 w-8 p-0"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelar}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {format(new Date(processo.prazo), "dd/MM/yyyy", { locale: ptBR })}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditandoPrazo(true)}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge className={getStatusPrazoColor(processo.status_prazo)}>
            {getStatusPrazoText(processo.status_prazo, processo.dias_restantes)}
          </Badge>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(Number(processo.valor))}
          </span>
        </div>

        {processo.observacoes && (
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">{processo.observacoes}</p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Criado em {format(new Date(processo.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}