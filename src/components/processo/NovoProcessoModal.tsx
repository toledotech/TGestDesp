import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, User, Car } from "lucide-react"
import { useProcessos, type CreateProcessoData, type ServicoTipo, type ProcessoStatus } from "@/hooks/useProcessos"
import { useToast } from "@/hooks/use-toast"

const servicosOptions: ServicoTipo[] = [
  'Transferência de Propriedade',
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

interface NovoProcessoModalProps {
  children?: React.ReactNode
}

export const NovoProcessoModal = ({ children }: NovoProcessoModalProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNovoCliente, setShowNovoCliente] = useState(false)
  const [showNovoVeiculo, setShowNovoVeiculo] = useState(false)
  
  const { createProcesso, createCliente, createVeiculo, clientes, veiculos } = useProcessos()
  const { toast } = useToast()

  const [formData, setFormData] = useState<CreateProcessoData>({
    cliente_id: '',
    veiculo_id: '',
    servico: 'Transferência de Propriedade',
    status: 'Recebido',
    valor: 0,
    prazo: '',
    observacoes: '',
    documentos_recebidos: []
  })

  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: ''
  })

  const [novoVeiculo, setNovoVeiculo] = useState({
    cliente_id: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    placa: '',
    chassi: '',
    renavam: ''
  })

  const documentosDisponiveis = [
    'RG/CPF do proprietário',
    'CNH válida',
    'Comprovante de residência',
    'CRLV anterior',
    'Nota fiscal/DUT',
    'Seguro obrigatório',
    'Comprovante de pagamento IPVA',
    'Comprovante de pagamento multas'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.cliente_id || !formData.veiculo_id || !formData.prazo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await createProcesso(formData)
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao criar processo:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCliente = async () => {
    if (!novoCliente.nome) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório.",
        variant: "destructive",
      })
      return
    }

    try {
      const cliente = await createCliente(novoCliente)
      setFormData(prev => ({ ...prev, cliente_id: cliente.id }))
      setNovoVeiculo(prev => ({ ...prev, cliente_id: cliente.id }))
      setShowNovoCliente(false)
      setNovoCliente({ nome: '', cpf_cnpj: '', telefone: '', email: '', endereco: '' })
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
    }
  }

  const handleCreateVeiculo = async () => {
    if (!novoVeiculo.marca || !novoVeiculo.modelo || !novoVeiculo.placa || !novoVeiculo.cliente_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios do veículo.",
        variant: "destructive",
      })
      return
    }

    try {
      const veiculo = await createVeiculo(novoVeiculo)
      setFormData(prev => ({ ...prev, veiculo_id: veiculo.id }))
      setShowNovoVeiculo(false)
      setNovoVeiculo({ cliente_id: '', marca: '', modelo: '', ano: new Date().getFullYear(), placa: '', chassi: '', renavam: '' })
    } catch (error) {
      console.error('Erro ao criar veículo:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      veiculo_id: '',
      servico: 'Transferência de Propriedade',
      status: 'Recebido',
      valor: 0,
      prazo: '',
      observacoes: '',
      documentos_recebidos: []
    })
    setShowNovoCliente(false)
    setShowNovoVeiculo(false)
  }

  const handleDocumentoChange = (documento: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      documentos_recebidos: checked
        ? [...(prev.documentos_recebidos || []), documento]
        : (prev.documentos_recebidos || []).filter(d => d !== documento)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Processo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Processo</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo processo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cliente">Cliente *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNovoCliente(!showNovoCliente)}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>

              {!showNovoCliente ? (
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
              ) : (
                <div className="space-y-3 p-4 border rounded-lg">
                  <Input
                    placeholder="Nome do cliente *"
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, nome: e.target.value }))}
                  />
                  <Input
                    placeholder="CPF/CNPJ"
                    value={novoCliente.cpf_cnpj}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                  />
                  <Input
                    placeholder="Telefone"
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder="Endereço"
                    value={novoCliente.endereco}
                    onChange={(e) => setNovoCliente(prev => ({ ...prev, endereco: e.target.value }))}
                  />
                  <Button type="button" onClick={handleCreateCliente} className="w-full">
                    Criar Cliente
                  </Button>
                </div>
              )}
            </div>

            {/* Veículo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="veiculo">Veículo *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNovoVeiculo(!showNovoVeiculo)}
                  className="gap-2"
                  disabled={!formData.cliente_id}
                >
                  <Car className="h-4 w-4" />
                  Novo Veículo
                </Button>
              </div>

              {!showNovoVeiculo ? (
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
              ) : (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Marca *"
                      value={novoVeiculo.marca}
                      onChange={(e) => setNovoVeiculo(prev => ({ ...prev, marca: e.target.value }))}
                    />
                    <Input
                      placeholder="Modelo *"
                      value={novoVeiculo.modelo}
                      onChange={(e) => setNovoVeiculo(prev => ({ ...prev, modelo: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Ano"
                      type="number"
                      value={novoVeiculo.ano}
                      onChange={(e) => setNovoVeiculo(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
                    />
                    <Input
                      placeholder="Placa *"
                      value={novoVeiculo.placa}
                      onChange={(e) => setNovoVeiculo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <Input
                    placeholder="Chassi"
                    value={novoVeiculo.chassi}
                    onChange={(e) => setNovoVeiculo(prev => ({ ...prev, chassi: e.target.value }))}
                  />
                  <Input
                    placeholder="RENAVAM"
                    value={novoVeiculo.renavam}
                    onChange={(e) => setNovoVeiculo(prev => ({ ...prev, renavam: e.target.value }))}
                  />
                  <Button 
                    type="button" 
                    onClick={handleCreateVeiculo} 
                    className="w-full"
                    disabled={!formData.cliente_id}
                  >
                    Criar Veículo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Dados do Processo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="servico">Tipo de Serviço *</Label>
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
              <Label htmlFor="valor">Valor (R$) *</Label>
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
              <Label htmlFor="prazo">Prazo *</Label>
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

          {/* Documentos Recebidos */}
          <div>
            <Label>Documentos Recebidos</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {documentosDisponiveis.map((documento) => (
                <div key={documento} className="flex items-center space-x-2">
                  <Checkbox
                    id={documento}
                    checked={(formData.documentos_recebidos || []).includes(documento)}
                    onCheckedChange={(checked) => handleDocumentoChange(documento, checked as boolean)}
                  />
                  <Label htmlFor={documento} className="text-sm">
                    {documento}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Processo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}