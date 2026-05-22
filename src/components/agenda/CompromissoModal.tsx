import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCompromissos, Compromisso } from '@/hooks/useCompromissos'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
  compromisso?: Compromisso | null
}

interface ClienteSimples {
  id: string
  nome: string
}

export function CompromissoModal({ open, onOpenChange, defaultDate, compromisso }: Props) {
  const { createCompromisso, updateCompromisso } = useCompromissos()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<ClienteSimples[]>([])

  const defaultDateTime = defaultDate
    ? format(defaultDate, "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    data_hora: defaultDateTime,
    cliente_id: '',
    tipo: 'Atendimento',
  })

  // Preenche o form ao editar
  useEffect(() => {
    if (compromisso) {
      setForm({
        titulo: compromisso.titulo,
        descricao: compromisso.descricao ?? '',
        data_hora: compromisso.data_hora.slice(0, 16),
        cliente_id: compromisso.cliente_id ?? '',
        tipo: compromisso.tipo,
      })
    } else {
      setForm({
        titulo: '',
        descricao: '',
        data_hora: defaultDate
          ? format(defaultDate, "yyyy-MM-dd'T'HH:mm")
          : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        cliente_id: '',
        tipo: 'Atendimento',
      })
    }
  }, [compromisso, defaultDate, open])

  // Carrega lista de clientes
  useEffect(() => {
    if (!open) return
    supabase
      .from('clientes')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setClientes(data || []))
  }, [open])

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.data_hora) return
    setLoading(true)
    try {
      const dados = {
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || undefined,
        data_hora: new Date(form.data_hora).toISOString(),
        cliente_id: form.cliente_id || undefined,
        tipo: form.tipo,
      }
      if (compromisso) {
        await updateCompromisso(compromisso.id, dados)
      } else {
        await createCompromisso(dados)
      }
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {compromisso ? 'Editar Compromisso' : 'Novo Compromisso'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Atendimento João Silva"
            />
          </div>

          {/* Data/Hora + Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_hora">Data e Hora *</Label>
              <Input
                id="data_hora"
                type="datetime-local"
                value={form.data_hora}
                onChange={e => setForm(p => ({ ...p, data_hora: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Atendimento">Atendimento</SelectItem>
                  <SelectItem value="Reunião">Reunião</SelectItem>
                  <SelectItem value="Ligação">Ligação</SelectItem>
                  <SelectItem value="Entrega">Entrega</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente (opcional)</Label>
            <Select
              value={form.cliente_id || 'none'}
              onValueChange={v => setForm(p => ({ ...p, cliente_id: v === 'none' ? '' : v }))}
            >
              <SelectTrigger><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {clientes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Observações</Label>
            <Textarea
              id="descricao"
              value={form.descricao}
              onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              placeholder="Detalhes do compromisso..."
              rows={3}
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !form.titulo.trim() || !form.data_hora}
            >
              {loading ? 'Salvando...' : compromisso ? 'Atualizar' : 'Agendar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
