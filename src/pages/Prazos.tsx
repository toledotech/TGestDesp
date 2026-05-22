import { useState } from "react"
import { PrazosHeader } from "@/components/prazos/PrazosHeader"
import { PrazoCard } from "@/components/prazos/PrazoCard"
import { usePrazos } from "@/hooks/usePrazos"
import { Loader2 } from "lucide-react"

const Prazos = () => {
  const {
    processos,
    estatisticas,
    loading,
    searchTerm,
    setSearchTerm,
    filtroStatus,
    setFiltroStatus,
    filtroProcesso,
    setFiltroProcesso,
    atualizarPrazo,
  } = usePrazos()

  return (
    <div className="p-6 space-y-6">
      <PrazosHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        filtroProcesso={filtroProcesso}
        setFiltroProcesso={setFiltroProcesso}
        estatisticas={estatisticas}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando prazos...</span>
        </div>
      ) : processos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || filtroStatus !== 'all' || filtroProcesso !== 'all' 
              ? 'Nenhum processo encontrado com os filtros aplicados.' 
              : 'Nenhum processo cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processos.map((processo) => (
            <PrazoCard
              key={processo.id}
              processo={processo}
              onUpdatePrazo={atualizarPrazo}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Prazos