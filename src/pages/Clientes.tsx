import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useClientes, Cliente } from "@/hooks/useClientes"
import { ClientesHeader } from "@/components/clientes/ClientesHeader"
import { ClienteCard } from "@/components/clientes/ClienteCard"
import { ClienteModal } from "@/components/clientes/ClienteModal"
import { Users } from "lucide-react"

export default function Clientes() {
  const {
    clientes,
    loading,
    searchTerm,
    setSearchTerm,
    stats,
    createCliente,
    updateCliente,
    deleteCliente
  } = useClientes()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null)

  const handleNewCliente = () => {
    setSelectedCliente(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDeleteCliente = (clienteId: string) => {
    setClienteToDelete(clienteId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (clienteToDelete) {
      await deleteCliente(clienteToDelete)
      setDeleteDialogOpen(false)
      setClienteToDelete(null)
    }
  }

  const handleSaveCliente = async (data: any) => {
    if (modalMode === 'create') {
      await createCliente(data)
    } else {
      await updateCliente(data)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ClientesHeader
        stats={stats}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewCliente={handleNewCliente}
        loading={loading}
      />

      {/* Lista de clientes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : clientes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onEdit={handleEditCliente}
              onDelete={handleDeleteCliente}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? 'Tente alterar os termos da busca para encontrar clientes.' 
              : 'Comece criando seu primeiro cliente para organizar melhor seus processos.'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={handleNewCliente}
              className="text-primary hover:underline"
            >
              Criar primeiro cliente
            </button>
          )}
        </div>
      )}

      {/* Modal de cliente */}
      <ClienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cliente={selectedCliente}
        onSave={handleSaveCliente}
        mode={modalMode}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
              Clientes com processos associados não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}