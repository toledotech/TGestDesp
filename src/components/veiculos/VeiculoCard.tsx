import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Edit, Trash2, User, Calendar, Hash } from "lucide-react"
import { Veiculo } from "@/hooks/useVeiculos"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface VeiculoCardProps {
  veiculo: Veiculo
  onEdit: (veiculo: Veiculo) => void
  onDelete: (id: string) => void
}

export const VeiculoCard = ({ veiculo, onEdit, onDelete }: VeiculoCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{veiculo.placa}</h3>
              <p className="text-sm text-muted-foreground">
                {veiculo.marca} {veiculo.modelo}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(veiculo)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(veiculo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          {veiculo.ano && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{veiculo.ano}</span>
            </div>
          )}
          
          {veiculo.cliente_nome && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{veiculo.cliente_nome}</span>
            </div>
          )}
        </div>

        {(veiculo.chassi || veiculo.renavam) && (
          <div className="space-y-2">
            {veiculo.chassi && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Chassi:</span>
                <span className="text-xs">{veiculo.chassi}</span>
              </div>
            )}
            
            {veiculo.renavam && (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Renavam:</span>
                <span className="text-xs">{veiculo.renavam}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Cadastrado em {format(new Date(veiculo.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <Badge variant="secondary" className="text-xs">
              {veiculo.marca}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}