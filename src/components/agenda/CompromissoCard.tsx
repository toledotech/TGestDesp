import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Edit, Trash2, CheckCircle } from "lucide-react"
import { Compromisso } from "@/hooks/useCompromissos"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

const TIPO_CLASSES: Record<string, string> = {
  'Atendimento': 'bg-blue-100 text-blue-700 border-blue-200',
  'Reunião':     'bg-purple-100 text-purple-700 border-purple-200',
  'Ligação':     'bg-green-100 text-green-700 border-green-200',
  'Entrega':     'bg-amber-100 text-amber-700 border-amber-200',
  'Outros':      'bg-gray-100 text-gray-700 border-gray-200',
}

interface Props {
  compromisso: Compromisso
  onEdit: (c: Compromisso) => void
  onDelete: (id: string) => void
  onConcluir: (id: string) => void
}

export function CompromissoCard({ compromisso, onEdit, onDelete, onConcluir }: Props) {
  const isConcluido = compromisso.status === 'concluido'
  const isCancelado = compromisso.status === 'cancelado'
  const tipoClass = TIPO_CLASSES[compromisso.tipo] ?? TIPO_CLASSES['Outros']

  return (
    <Card className={`transition-all ${isConcluido || isCancelado ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Conteúdo */}
          <div className="flex-1 space-y-1.5 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tipoClass}`}>
                {compromisso.tipo}
              </span>
              {isConcluido && (
                <Badge className="text-xs bg-green-500 border-0">Concluído</Badge>
              )}
              {isCancelado && (
                <Badge variant="secondary" className="text-xs">Cancelado</Badge>
              )}
            </div>

            {/* Título */}
            <p className={`font-semibold text-sm truncate ${isConcluido ? 'line-through text-muted-foreground' : ''}`}>
              {compromisso.titulo}
            </p>

            {/* Hora */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              {format(parseISO(compromisso.data_hora), "HH:mm", { locale: ptBR })}
            </div>

            {/* Cliente */}
            {compromisso.cliente?.nome && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{compromisso.cliente.nome}</span>
              </div>
            )}

            {/* Observações */}
            {compromisso.descricao && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {compromisso.descricao}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-1 shrink-0">
            {!isConcluido && !isCancelado && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Marcar como concluído"
                onClick={() => onConcluir(compromisso.id)}
              >
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Editar"
              onClick={() => onEdit(compromisso)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
              title="Excluir"
              onClick={() => onDelete(compromisso.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
