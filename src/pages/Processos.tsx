import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FileText, Search, Filter } from "lucide-react"
import { useProcessos, type Processo, type ProcessoStatus } from "@/hooks/useProcessos"
import { NovoProcessoModal } from "@/components/processo/NovoProcessoModal"
import { ProcessoCard } from "@/components/processo/ProcessoCard"
import { EditarProcessoModal } from "@/components/processo/EditarProcessoModal"

const Processos = () => {
  const { processos, loading, updateProcesso, deleteProcesso } = useProcessos()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [servicoFilter, setServicoFilter] = useState<string>("todos")
  const [processoToEdit, setProcessoToEdit] = useState<Processo | null>(null)
  const [processoToDelete, setProcessoToDelete] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const statusColumns: ProcessoStatus[] = ["Recebido", "Em Conferência", "No DETRAN", "Aguardando Pagamento", "Concluído"]

  const filteredProcessos = processos.filter(processo => {
    const matchesSearch = !searchTerm || 
      processo.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.veiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      processo.numero_protocolo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "todos" || processo.status === statusFilter
    const matchesServico = servicoFilter === "todos" || processo.servico === servicoFilter
    
    return matchesSearch && matchesStatus && matchesServico
  })

  const getProcessosByStatus = (status: ProcessoStatus) => {
    return filteredProcessos.filter(p => p.status === status)
  }

  const handleStatusChange = async (id: string, newStatus: ProcessoStatus) => {
    try {
      await updateProcesso(id, { status: newStatus })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleDelete = async () => {
    if (processoToDelete) {
      try {
        await deleteProcesso(processoToDelete)
        setProcessoToDelete(null)
      } catch (error) {
        console.error('Erro ao excluir processo:', error)
      }
    }
  }

  const handleDrop = (e: React.DragEvent, newStatus: ProcessoStatus) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    if (data.currentStatus !== newStatus) {
      handleStatusChange(data.id, newStatus)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando processos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Processos</h1>
          <p className="text-muted-foreground">Gerencie todos os processos em andamento</p>
        </div>
        <NovoProcessoModal />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por cliente, veículo ou protocolo..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {statusColumns.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={servicoFilter} onValueChange={setServicoFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Transferência de Propriedade">Transferência de Propriedade</SelectItem>
                <SelectItem value="Licenciamento Anual">Licenciamento Anual</SelectItem>
                <SelectItem value="2ª Via CRV">2ª Via CRV</SelectItem>
                <SelectItem value="Comunicação de Venda">Comunicação de Venda</SelectItem>
                <SelectItem value="IPVA">IPVA</SelectItem>
                <SelectItem value="Multas">Multas</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
        {statusColumns.map((status) => (
          <Card 
            key={status} 
            className="flex flex-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {status}
                <Badge variant="secondary" className="text-xs">
                  {getProcessosByStatus(status).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 max-h-[500px] overflow-y-auto">
              {getProcessosByStatus(status).map((processo) => (
                <ProcessoCard
                  key={processo.id}
                  processo={processo}
                  onEdit={(p) => {
                    setProcessoToEdit(p)
                    setEditModalOpen(true)
                  }}
                  onDelete={(id) => setProcessoToDelete(id)}
                  onView={(p) => {
                    setProcessoToEdit(p)
                    setEditModalOpen(true)
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {getProcessosByStatus(status).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum processo neste status
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo de Processos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{processos.length}</div>
              <p className="text-sm text-muted-foreground">Total de Processos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {processos.filter(p => p.status !== "Concluído").length}
              </div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {processos.filter(p => p.status === "Concluído").length}
              </div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                R$ {processos.reduce((acc, p) => acc + p.valor, 0).toFixed(2).replace('.', ',')}
              </div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <EditarProcessoModal
        processo={processoToEdit}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <AlertDialog open={!!processoToDelete} onOpenChange={() => setProcessoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Processos