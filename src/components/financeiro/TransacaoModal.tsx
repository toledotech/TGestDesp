import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransacaoFinanceira, TransacaoFormData } from "@/hooks/useFinanceiro"
import { useClientes } from "@/hooks/useClientes"
import { useProcessos } from "@/hooks/useProcessos"

interface TransacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (dados: TransacaoFormData) => Promise<{ error: any } | { data: any; error: null }>
  transacao?: TransacaoFinanceira | null
  mode: 'create' | 'edit'
}

const categorias = [
  'Serviços Prestados',
  'Consultorias',
  'Produtos',
  'Aluguel',
  'Fornecedores',
  'Marketing',
  'Escritório',
  'Transporte',
  'Tecnologia',
  'Juridico',
  'Contabilidade',
  'Outros'
]

const metodosPagamento = [
  'Dinheiro',
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Transferência Bancária',
  'Boleto',
  'Cheque'
]

export const TransacaoModal = ({ isOpen, onClose, onSave, transacao, mode }: TransacaoModalProps) => {
  const [formData, setFormData] = useState<TransacaoFormData>({
    tipo: 'receita',
    categoria: '',
    descricao: '',
    valor: 0,
    data_transacao: new Date().toISOString().split('T')[0],
    processo_id: undefined,
    cliente_id: undefined,
    metodo_pagamento: undefined,
    status: 'pendente',
    observacoes: '',
  })
  const [loading, setLoading] = useState(false)
  const { clientes } = useClientes()
  const { processos } = useProcessos()

  useEffect(() => {
    if (mode === 'edit' && transacao) {
      setFormData({
        tipo: transacao.tipo,
        categoria: transacao.categoria,
        descricao: transacao.descricao,
        valor: Number(transacao.valor),
        data_transacao: transacao.data_transacao,
        processo_id: transacao.processo_id || undefined,
        cliente_id: transacao.cliente_id || undefined,
        metodo_pagamento: transacao.metodo_pagamento || undefined,
        status: transacao.status,
        observacoes: transacao.observacoes || '',
      })
    } else {
      setFormData({
        tipo: 'receita',
        categoria: '',
        descricao: '',
        valor: 0,
        data_transacao: new Date().toISOString().split('T')[0],
        processo_id: undefined,
        cliente_id: undefined,
        metodo_pagamento: undefined,
        status: 'pendente',
        observacoes: '',
      })
    }
  }, [mode, transacao, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dadosParaSalvar = {
        ...formData,
        processo_id: formData.processo_id || undefined,
        cliente_id: formData.cliente_id || undefined,
        metodo_pagamento: formData.metodo_pagamento || undefined,
        observacoes: formData.observacoes || undefined,
      }

      const result = await onSave(dadosParaSalvar)
      
      if (!result.error) {
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Transação' : 'Editar Transação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'receita' | 'despesa') => 
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pendente' | 'pago' | 'cancelado') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição da transação"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  valor: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_transacao">Data *</Label>
              <Input
                id="data_transacao"
                type="date"
                value={formData.data_transacao}
                onChange={(e) => setFormData(prev => ({ ...prev, data_transacao: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
              <Select
                value={formData.metodo_pagamento || "none"}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  metodo_pagamento: value === "none" ? undefined : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informado</SelectItem>
                  {metodosPagamento.map((metodo) => (
                    <SelectItem key={metodo} value={metodo}>
                      {metodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select
                value={formData.cliente_id || "none"}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  cliente_id: value === "none" ? undefined : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum cliente</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="processo_id">Processo</Label>
              <Select
                value={formData.processo_id || "none"}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  processo_id: value === "none" ? undefined : value
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um processo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum processo</SelectItem>
                  {processos.map((processo) => (
                    <SelectItem key={processo.id} value={processo.id}>
                      {processo.numero_protocolo} - {processo.servico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : mode === 'create' ? 'Criar Transação' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}