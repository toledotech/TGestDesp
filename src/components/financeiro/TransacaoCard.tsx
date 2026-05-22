import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, TrendingUp, TrendingDown, User, Calendar, FileText } from "lucide-react"
import { TransacaoFinanceira } from "@/hooks/useFinanceiro"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TransacaoCardProps {
  transacao: TransacaoFinanceira
  onEdit: (transacao: TransacaoFinanceira) => void
  onDelete: (id: string) => void
}

export const TransacaoCard = ({ transacao, onEdit, onDelete }: TransacaoCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-500/10 text-green-700 border-green-200'
      case 'pendente': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'cancelado': return 'bg-red-500/10 text-red-700 border-red-200'
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago'
      case 'pendente': return 'Pendente'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              transacao.tipo === 'receita' 
                ? 'bg-green-500/10' 
                : 'bg-red-500/10'
            }`}>
              {transacao.tipo === 'receita' ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{transacao.descricao}</h3>
              <p className="text-sm text-muted-foreground">{transacao.categoria}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(transacao)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(transacao.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className={`text-2xl font-bold ${
            transacao.tipo === 'receita' 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Number(transacao.valor))}
          </p>
          <Badge className={getStatusColor(transacao.status)}>
            {getStatusText(transacao.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(transacao.data_transacao), "dd/MM/yyyy", { locale: ptBR })}</span>
          </div>
          
          {transacao.cliente_nome && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{transacao.cliente_nome}</span>
            </div>
          )}
        </div>

        {transacao.metodo_pagamento && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{transacao.metodo_pagamento}</span>
          </div>
        )}

        {transacao.observacoes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{transacao.observacoes}</p>
          </div>
        )}

        <div className="pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Criado em {format(new Date(transacao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}