import { useState } from "react"
import { VeiculosHeader } from "@/components/veiculos/VeiculosHeader" 
import { VeiculoCard } from "@/components/veiculos/VeiculoCard"
import { VeiculoModal } from "@/components/veiculos/VeiculoModal"
import { useVeiculos, Veiculo } from "@/hooks/useVeiculos"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

const Veiculos = () => {
  const { 
    veiculos, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    criarVeiculo, 
    atualizarVeiculo, 
    excluirVeiculo 
  } = useVeiculos()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState<string | null>(null)

  const handleNovoVeiculo = () => {
    setModalMode('create')
    setVeiculoSelecionado(null)
    setModalOpen(true)
  }

  const handleEditarVeiculo = (veiculo: Veiculo) => {
    setModalMode('edit')
    setVeiculoSelecionado(veiculo)
    setModalOpen(true)
  }

  const handleExcluirVeiculo = (id: string) => {
    setVeiculoParaExcluir(id)
    setDeleteDialogOpen(true)
  }

  const confirmarExclusao = async () => {
    if (veiculoParaExcluir) {
      await excluirVeiculo(veiculoParaExcluir)
      setDeleteDialogOpen(false)
      setVeiculoParaExcluir(null)
    }
  }

  const handleSalvarVeiculo = async (dados: any) => {
    if (modalMode === 'create') {
      return await criarVeiculo(dados)
    } else if (veiculoSelecionado) {
      return await atualizarVeiculo(veiculoSelecionado.id, dados)
    }
    return { error: 'Modo inválido' }
  }

  // Calcular estatísticas
  const totalVeiculos = veiculos.length
  const veiculosComCliente = veiculos.filter(v => v.cliente_id).length
  const anoAtual = new Date().getFullYear()
  const veiculosEsteAno = veiculos.filter(v => 
    new Date(v.created_at).getFullYear() === anoAtual
  ).length

  return (
    <div className="p-6 space-y-6">
      <VeiculosHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNovoVeiculo={handleNovoVeiculo}
        totalVeiculos={totalVeiculos}
        veiculosComCliente={veiculosComCliente}
        veiculosEsteAno={veiculosEsteAno}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando veículos...</span>
        </div>
      ) : veiculos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhum veículo encontrado com os filtros aplicados.' : 'Nenhum veículo cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {veiculos.map((veiculo) => (
            <VeiculoCard
              key={veiculo.id}
              veiculo={veiculo}
              onEdit={handleEditarVeiculo}
              onDelete={handleExcluirVeiculo}
            />
          ))}
        </div>
      )}

      <VeiculoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSalvarVeiculo}
        veiculo={veiculoSelecionado}
        mode={modalMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
              Se este veículo possuir processos vinculados, não será possível excluí-lo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarExclusao}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Veiculos