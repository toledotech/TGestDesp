import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Car, Users, Calendar } from "lucide-react"

interface VeiculosHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  onNovoVeiculo: () => void
  totalVeiculos: number
  veiculosComCliente: number
  veiculosEsteAno: number
}

export const VeiculosHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  onNovoVeiculo,
  totalVeiculos,
  veiculosComCliente,
  veiculosEsteAno
}: VeiculosHeaderProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie os veículos cadastrados no sistema
          </p>
        </div>
        <Button onClick={onNovoVeiculo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Veículos</p>
                <p className="text-2xl font-bold">{totalVeiculos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Cliente</p>
                <p className="text-2xl font-bold">{veiculosComCliente}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deste Ano</p>
                <p className="text-2xl font-bold">{veiculosEsteAno}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por placa, marca, modelo ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  )
}