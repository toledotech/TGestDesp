import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Cliente, CreateClienteData, UpdateClienteData } from "@/hooks/useClientes"

interface ClienteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente | null
  onSave: (data: CreateClienteData | UpdateClienteData) => Promise<void>
  mode: 'create' | 'edit'
}

export function ClienteModal({ 
  open, 
  onOpenChange, 
  cliente, 
  onSave, 
  mode 
}: ClienteModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cep: '',
    cidade: '',
    uf: '',
  })
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cliente && mode === 'edit') {
      setFormData({
        nome: cliente.nome || '',
        cpf_cnpj: cliente.cpf_cnpj || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        endereco: cliente.endereco || '',
        cep: cliente.cep || '',
        cidade: cliente.cidade || '',
        uf: cliente.uf || '',
      })
    } else {
      setFormData({
        nome: '',
        cpf_cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cep: '',
        cidade: '',
        uf: '',
      })
    }
  }, [cliente, mode, open])

  const handleSave = async () => {
    if (!formData.nome.trim()) return

    try {
      setLoading(true)
      
      if (mode === 'edit' && cliente) {
        await onSave({ ...formData, id: cliente.id })
      } else {
        await onSave(formData)
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 11) {
      // Formato CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      // Formato CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    
    if (numbers.length <= 10) {
      // Telefone fixo
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      // Celular
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }

  const handleCpfCnpjChange = (value: string) => {
    const formatted = formatCpfCnpj(value)
    if (formatted.replace(/\D/g, '').length <= 14) {
      setFormData(prev => ({ ...prev, cpf_cnpj: formatted }))
    }
  }

  const handleTelefoneChange = (value: string) => {
    const formatted = formatTelefone(value)
    if (formatted.replace(/\D/g, '').length <= 11) {
      setFormData(prev => ({ ...prev, telefone: formatted }))
    }
  }

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8)
    if (numbers.length > 5) return numbers.slice(0, 5) + '-' + numbers.slice(5)
    return numbers
  }

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value)
    setFormData(prev => ({ ...prev, cep: formatted }))

    const digits = formatted.replace(/\D/g, '')
    if (digits.length === 8) {
      setBuscandoCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro ? `${data.logradouro}, ${data.bairro}` : prev.endereco,
            cidade: data.localidade || prev.cidade,
            uf: data.uf || prev.uf,
          }))
        }
      } catch {
        // silencia erro de busca de CEP
      } finally {
        setBuscandoCep(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome completo do cliente"
              required
            />
          </div>

          <div>
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={(e) => handleCpfCnpjChange(e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="cliente@email.com"
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleTelefoneChange(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <Label htmlFor="cep">CEP {buscandoCep && <span className="text-xs text-muted-foreground ml-1">buscando...</span>}</Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Endereço completo do cliente"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label htmlFor="uf">UF</Label>
              <Input
                id="uf"
                value={formData.uf}
                onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value.toUpperCase().slice(0, 2) }))}
                placeholder="GO"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={loading || !formData.nome.trim()}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}