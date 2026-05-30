import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Car, Plus, Edit, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { VeiculoModal } from "@/components/veiculos/VeiculoModal"
import { Veiculo } from "@/hooks/useVeiculos"
import { Cliente } from "@/hooks/useClientes"

interface ClienteVeiculosModalProps {
  cliente: Cliente
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClienteVeiculosModal({ cliente, open, onOpenChange }: ClienteVeiculosModalProps) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [veiculoModalOpen, setVeiculoModalOpen] = useState(false)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) fetchVeiculos()
  }, [open, cliente.id])

  const fetchVeiculos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVeiculos((data || []).map(v => ({ ...v, cliente_nome: cliente.nome })))
    } catch {
      toast({ title: "Erro ao carregar veículos", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSalvar = async (dados: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    if (veiculoSelecionado) {
      const { error } = await supabase
        .from('veiculos')
        .update(dados)
        .eq('id', veiculoSelecionado.id)
      if (error) return { error }
      toast({ title: "Veículo atualizado com sucesso!" })
    } else {
      const { error } = await supabase
        .from('veiculos')
        .insert([{ ...dados, cliente_id: cliente.id, user_id: user.id }])
      if (error) return { error }
      toast({ title: "Veículo adicionado com sucesso!" })
    }

    await fetchVeiculos()
    return { data: true, error: null }
  }

  const handleExcluir = async (id: string) => {
    const { data: processos } = await supabase
      .from('processos')
      .select('id')
      .eq('veiculo_id', id)
      .limit(1)

    if (processos && processos.length > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Este veículo possui processos vinculados.",
        variant: "destructive",
      })
      return
    }

    await supabase.from('veiculos').delete().eq('id', id)
    toast({ title: "Veículo excluído com sucesso!" })
    await fetchVeiculos()
  }

  const handleNovoVeiculo = () => {
    setVeiculoSelecionado(null)
    setVeiculoModalOpen(true)
  }

  const handleEditarVeiculo = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo)
    setVeiculoModalOpen(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Veículos de {cliente.nome}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {loading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)
            ) : veiculos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum veículo cadastrado para este cliente</p>
              </div>
            ) : (
              veiculos.map(v => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{v.marca} {v.modelo}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="font-mono text-xs">{v.placa}</Badge>
                        {v.ano && <span className="text-xs text-muted-foreground">{v.ano}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarVeiculo(v)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleExcluir(v.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}

            <Button onClick={handleNovoVeiculo} className="w-full gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Adicionar Veículo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <VeiculoModal
        isOpen={veiculoModalOpen}
        onClose={() => setVeiculoModalOpen(false)}
        onSave={handleSalvar}
        veiculo={veiculoSelecionado}
        mode={veiculoSelecionado ? 'edit' : 'create'}
      />
    </>
  )
}
