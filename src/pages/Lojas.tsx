import { useState } from 'react'
import { Store, Plus, Search, Pencil, Trash2, Phone, Mail, User, CheckCircle, XCircle, Building2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { useLojas, Loja, LojaFormData, TIPOS_LOJA } from '@/hooks/useLojas'
import { useSaldosLojas } from '@/hooks/useCreditosLoja'
import { CreditosLojaModal } from '@/components/lojas/CreditosLojaModal'

const TIPO_BADGE: Record<string, string> = {
  'Concessionária':       'bg-blue-100 text-blue-700 border-blue-200',
  'Loja':                 'bg-green-100 text-green-700 border-green-200',
  'Indicador':            'bg-purple-100 text-purple-700 border-purple-200',
  'Despachante Parceiro': 'bg-amber-100 text-amber-700 border-amber-200',
  'Outro':                'bg-gray-100 text-gray-600 border-gray-200',
}

const formVazio: LojaFormData = {
  nome: '', tipo: 'Loja', cnpj: '', telefone: '', email: '', contato: '', observacoes: '', ativo: true,
}

// ─── Modal Loja ───────────────────────────────────────────────────────────────
interface LojaModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  loja?: Loja | null
  onSave: (dados: LojaFormData) => Promise<any>
}

function LojaModal({ open, onOpenChange, loja, onSave }: LojaModalProps) {
  const [form, setForm] = useState<LojaFormData>(loja ? {
    nome: loja.nome, tipo: loja.tipo, cnpj: loja.cnpj || '',
    telefone: loja.telefone || '', email: loja.email || '',
    contato: loja.contato || '', observacoes: loja.observacoes || '', ativo: loja.ativo,
  } : formVazio)
  const [loading, setLoading] = useState(false)

  const set = (field: keyof LojaFormData, value: any) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleSave = async () => {
    if (!form.nome.trim()) return
    setLoading(true)
    const { error } = await onSave(form)
    setLoading(false)
    if (!error) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {loja ? 'Editar Loja' : 'Nova Loja'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Nome *</Label>
              <Input placeholder="Nome da loja" value={form.nome} onChange={e => set('nome', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => set('tipo', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_LOJA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={e => set('cnpj', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Responsável / Contato</Label>
              <Input placeholder="Nome do responsável" value={form.contato} onChange={e => set('contato', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" value={form.telefone} onChange={e => set('telefone', e.target.value)} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>E-mail</Label>
              <Input type="email" placeholder="contato@loja.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Informações adicionais..." value={form.observacoes} onChange={e => set('observacoes', e.target.value)} rows={3} />
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <Switch checked={form.ativo} onCheckedChange={v => set('ativo', v)} />
              <Label>{form.ativo ? 'Loja ativa' : 'Loja inativa'}</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading || !form.nome.trim()}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Lojas() {
  const { lojas, loading, searchTerm, setSearchTerm, criarLoja, atualizarLoja, excluirLoja } = useLojas()
  const { saldos } = useSaldosLojas()
  const [modalOpen, setModalOpen] = useState(false)
  const [editLoja, setEditLoja] = useState<Loja | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<Loja | null>(null)
  const [creditosLoja, setCreditosLoja] = useState<Loja | null>(null)

  const ativas   = lojas.filter(l => l.ativo)
  const inativas = lojas.filter(l => !l.ativo)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Store className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lojas</h1>
            <p className="text-sm text-muted-foreground">
              {ativas.length} ativa{ativas.length !== 1 ? 's' : ''}
              {inativas.length > 0 && `, ${inativas.length} inativa${inativas.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <Button onClick={() => { setEditLoja(null); setModalOpen(true) }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Loja
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, contato ou tipo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TIPOS_LOJA.slice(0, 4).map(tipo => {
          const count = lojas.filter(l => l.tipo === tipo && l.ativo).length
          return (
            <Card key={tipo} className="shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{tipo}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : lojas.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center">
            <Store className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Nenhuma loja cadastrada</p>
            <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Loja" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {lojas.map(loja => (
            <Card key={loja.id} className={`shadow-sm transition-all hover:shadow-md ${!loja.ativo ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{loja.nome}</p>
                      {loja.cnpj && <p className="text-xs text-muted-foreground">{loja.cnpj}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {loja.ativo
                      ? <CheckCircle className="h-4 w-4 text-green-500" />
                      : <XCircle className="h-4 w-4 text-red-400" />
                    }
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${TIPO_BADGE[loja.tipo] ?? TIPO_BADGE['Outro']}`}>
                    {loja.tipo}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {loja.contato && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      <span>{loja.contato}</span>
                    </div>
                  )}
                  {loja.telefone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      <span>{loja.telefone}</span>
                    </div>
                  )}
                  {loja.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{loja.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      {loja.total_processos ?? 0} processo{(loja.total_processos ?? 0) !== 1 ? 's' : ''}
                    </span>
                    {saldos[loja.id] !== undefined && saldos[loja.id] !== 0 && (
                      <span className={`text-xs font-semibold ${
                        saldos[loja.id] > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {saldos[loja.id] > 0
                          ? `Deve ${saldos[loja.id].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                          : `A receber ${Math.abs(saldos[loja.id]).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                        }
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setCreditosLoja(loja)}
                      title="Créditos / Débitos"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setEditLoja(loja); setModalOpen(true) }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteDialog(loja)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      <LojaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        loja={editLoja}
        onSave={dados => editLoja ? atualizarLoja(editLoja.id, dados) : criarLoja(dados)}
      />

      {/* Modal créditos */}
      {creditosLoja && (
        <CreditosLojaModal
          open={!!creditosLoja}
          onOpenChange={o => !o && setCreditosLoja(null)}
          loja={creditosLoja}
        />
      )}

      {/* Dialog excluir */}
      <AlertDialog open={!!deleteDialog} onOpenChange={o => !o && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir loja?</AlertDialogTitle>
            <AlertDialogDescription>
              A loja <strong>{deleteDialog?.nome}</strong> será removida. Os processos vinculados a ela perderão o vínculo, mas não serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => { await excluirLoja(deleteDialog!.id); setDeleteDialog(null) }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
