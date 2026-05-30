import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { type Processo, type UpdateProcessoData, type ServicoTipo, type ProcessoStatus, useProcessos } from "@/hooks/useProcessos"
import { useLojas } from "@/hooks/useLojas"

const servicosOptions: ServicoTipo[] = [
  'Transferência de Propriedade',
  'ATPV (Intenção de Venda)',
  'Licenciamento Anual',
  '2ª Via CRV',
  'Comunicação de Venda',
  'IPVA',
  'Multas',
  'Outros'
]

const statusOptions: ProcessoStatus[] = [
  'Recebido',
  'Em Conferência',
  'No DETRAN',
  'Aguardando Pagamento',
  'Concluído'
]

interface EditarProcessoModalProps {
  processo: Processo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditarProcessoModal = ({ processo, open, onOpenChange }: EditarProcessoModalProps) => {
  const [loading, setLoading] = useState(false)
  const { updateProcesso, clientes, veiculos } = useProcessos()
  const { lojas } = useLojas()

  const [formData, setFormData] = useState<UpdateProcessoData>({
    cliente_id: '',
    veiculo_id: '',
    loja_id: '',
    numero_processo: '',
    data_abertura: '',
    servico: 'Transferência de Propriedade',
    status: 'Recebido',
    valor: 0,
    valor_dut: 0,
    valor_boleto: 0,
    prazo: '',
    observacoes: '',
    documentos_recebidos: []
  })

  const [tipoPessoa, setTipoPessoa] = useState<'fisica' | 'juridica'>('fisica')

  const documentosPF = [
    'RG/CPF ou CNH do proprietário',
    'Comprovante de residência / Declaração de endereço',
    'CRLV anterior',
    'Nota fiscal/ATPV',
    'Vistoria ECV',
    'Procuração Despachante',
    'Procuração Particular/pública',
  ]

  const documentosPJ = [
    'Contrato Social',
    'Cartão CNPJ',
    'RG/CPF ou CNH do responsável legal',
    'CRLV anterior',
    'Nota fiscal/ATPV',
    'Vistoria ECV',
    'Procuração Despachante',
    'Procuração Particular/pública',
  ]

  const documentosDisponiveis = tipoPessoa === 'fisica' ? documentosPF : documentosPJ

  useEffect(() => {
    if (processo && open) {
      setFormData({
        cliente_id: processo.cliente_id,
        veiculo_id: processo.veiculo_id,
        loja_id: processo.loja_id || '',
        numero_processo: processo.numero_processo || '',
        data_abertura: processo.data_abertura || '',
        servico: processo.servico,
        status: processo.status,
        valor: processo.valor,
        valor_dut: processo.valor_dut || 0,
        valor_boleto: processo.valor_boleto || 0,
        prazo: processo.prazo || '',
        observacoes: processo.observacoes || '',
        documentos_recebidos: processo.documentos_recebidos || []
      })

      // Auto-detectar PF/PJ pelo CPF/CNPJ do cliente
      const cpfCnpj = processo.cliente?.cpf_cnpj?.replace(/\D/g, '') || ''
      setTipoPessoa(cpfCnpj.length === 14 ? 'juridica' : 'fisica')
    }
  }, [processo, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!processo) return

    try {
      setLoading(true)
      await updateProcesso(processo.id, formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atualizar processo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentoChange = (documento: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      documentos_recebidos: checked
        ? [...(prev.documentos_recebidos || []), documento]
        : (prev.documentos_recebidos || []).filter(d => d !== documento)
    }))
  }

  if (!processo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Processo #{processo.numero_protocolo}</DialogTitle>
          <DialogDescription>
            Altere as informações do processo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => setFormData(prev => ({ ...prev, cliente_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} {cliente.cpf_cnpj && `- ${cliente.cpf_cnpj}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="veiculo">Veículo</Label>
              <Select value={formData.veiculo_id} onValueChange={(value) => setFormData(prev => ({ ...prev, veiculo_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos
                    .filter(veiculo => !formData.cliente_id || veiculo.cliente_id === formData.cliente_id)
                    .map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.marca} {veiculo.modelo} - {veiculo.placa}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Número do Processo e Data de Abertura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Número do Processo</Label>
              <Input
                placeholder="Ex: 2025/001234"
                value={formData.numero_processo || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, numero_processo: e.target.value }))}
              />
            </div>
            <div>
              <Label>Data de Abertura</Label>
              <Input
                type="date"
                value={formData.data_abertura || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, data_abertura: e.target.value }))}
              />
            </div>
          </div>

          {/* Loja / DUT / Boleto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Loja / Origem</Label>
              <Select value={formData.loja_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, loja_id: value === 'none' ? undefined : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar loja (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {lojas.filter(l => l.ativo).map((loja) => (
                    <SelectItem key={loja.id} value={loja.id}>
                      {loja.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Taxas Detran (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.valor_dut || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_dut: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Valor Boleto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.valor_boleto || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, valor_boleto: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="servico">Tipo de Serviço</Label>
              <Select value={formData.servico} onValueChange={(value: ServicoTipo) => setFormData(prev => ({ ...prev, servico: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {servicosOptions.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: ProcessoStatus) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prazo">Prazo</Label>
              <Input
                type="date"
                value={formData.prazo}
                onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                placeholder="Observações sobre o processo..."
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Documentos Recebidos</Label>
              <div className="flex rounded-md border overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => { setTipoPessoa('fisica'); setFormData(prev => ({ ...prev, documentos_recebidos: [] })) }}
                  className={`px-3 py-1 transition-colors ${tipoPessoa === 'fisica' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  Pessoa Física
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoPessoa('juridica'); setFormData(prev => ({ ...prev, documentos_recebidos: [] })) }}
                  className={`px-3 py-1 transition-colors ${tipoPessoa === 'juridica' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  Pessoa Jurídica
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {documentosDisponiveis.map((documento) => (
                <div key={documento} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${documento}`}
                    checked={(formData.documentos_recebidos || []).includes(documento)}
                    onCheckedChange={(checked) => handleDocumentoChange(documento, checked as boolean)}
                  />
                  <Label htmlFor={`edit-${documento}`} className="text-sm leading-tight">
                    {documento}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}