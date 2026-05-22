import { useState } from "react"
import { FinanceiroHeader } from "@/components/financeiro/FinanceiroHeader"
import { TransacaoCard } from "@/components/financeiro/TransacaoCard"
import { TransacaoModal } from "@/components/financeiro/TransacaoModal"
import { useFinanceiro, TransacaoFinanceira } from "@/hooks/useFinanceiro"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

const Financeiro = () => {
  const {
    transacoes,
    estatisticas,
    loading,
    searchTerm,
    setSearchTerm,
    filtroTipo,
    setFiltroTipo,
    filtroStatus,
    setFiltroStatus,
    criarTransacao,
    atualizarTransacao,
    excluirTransacao
  } = useFinanceiro()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [transacaoSelecionada, setTransacaoSelecionada] = useState<TransacaoFinanceira | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<string | null>(null)

  const handleNovaTransacao = () => {
    setModalMode('create')
    setTransacaoSelecionada(null)
    setModalOpen(true)
  }

  const handleEditarTransacao = (transacao: TransacaoFinanceira) => {
    setModalMode('edit')
    setTransacaoSelecionada(transacao)
    setModalOpen(true)
  }

  const handleExcluirTransacao = (id: string) => {
    setTransacaoParaExcluir(id)
    setDeleteDialogOpen(true)
  }

  const confirmarExclusao = async () => {
    if (transacaoParaExcluir) {
      await excluirTransacao(transacaoParaExcluir)
      setDeleteDialogOpen(false)
      setTransacaoParaExcluir(null)
    }
  }

  const handleSalvarTransacao = async (dados: any) => {
    if (modalMode === 'create') {
      return await criarTransacao(dados)
    } else if (transacaoSelecionada) {
      return await atualizarTransacao(transacaoSelecionada.id, dados)
    }
    return { error: 'Modo inválido' }
  }

  return (
    <div className="p-6 space-y-6">
      <FinanceiroHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtroTipo={filtroTipo}
        setFiltroTipo={setFiltroTipo}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        onNovaTransacao={handleNovaTransacao}
        estatisticas={estatisticas}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando transações...</span>
        </div>
      ) : transacoes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || filtroTipo !== 'all' || filtroStatus !== 'all' 
              ? 'Nenhuma transação encontrada com os filtros aplicados.' 
              : 'Nenhuma transação cadastrada ainda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transacoes.map((transacao) => (
            <TransacaoCard
              key={transacao.id}
              transacao={transacao}
              onEdit={handleEditarTransacao}
              onDelete={handleExcluirTransacao}
            />
          ))}
        </div>
      )}

      <TransacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSalvarTransacao}
        transacao={transacaoSelecionada}
        mode={modalMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
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

export default Financeiro