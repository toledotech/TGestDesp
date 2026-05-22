import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, Store } from 'lucide-react'
import { useCreditosLoja, type CreditoLojaFormData, type CreditoLoja } from '@/hooks/useCreditosLoja'
import type { Loja } from '@/hooks/useLojas'

interface CreditosLojaModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  loja: Loja
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formInicial: CreditoLojaFormData = {
  tipo: 'credito',
  descricao: '',
  valor: 0,
  data: new Date().toISOString().split('T')[0],
  processo_id: undefined,
}

export function CreditosLojaModal({ open, onOpenChange, loja }: CreditosLojaModalProps) {
  const { lancamentos, loading, saldo, totalCreditos, totalDebitos, criarLancamento, excluirLancamento } =
    useCreditosLoja(open ? loja.id : undefined)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreditoLojaFormData>(formInicial)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const set = (field: keyof CreditoLojaFormData, value: any) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleSalvar = async () => {
    if (!form.descricao.trim() || form.valor <= 0) return
    setSaving(true)
    const { error } = await criarLancamento(form)
    setSaving(false)
    if (!error) {
      setForm(formInicial)
      setShowForm(false)
    }
  }

  const handleExcluir = async () => {
    if (!deleteId) return
    await excluirLancamento(deleteId)
    setDeleteId(null)
  }

  // Cor e ícone do saldo
  const saldoInfo = saldo > 0
    ? { label: 'Despachante deve à loja', color: 'text-red-600',   bg: 'bg-red-50 border-red-200',   icon: TrendingDown }
    : saldo < 0
    ? { label: 'Loja deve ao despachante', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: TrendingUp }
    : { label: 'Saldo zerado',             color: 'text-gray-500',  bg: 'bg-gray-50 border-gray-200',   icon: Minus }

  const SaldoIcon = saldoInfo.icon

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Créditos — {loja.nome}
            </DialogTitle>
          </DialogHeader>

          {/* ── Resumo de saldo ── */}
          <div className={`rounded-xl border p-4 ${saldoInfo.bg}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <SaldoIcon className={`h-6 w-6 ${saldoInfo.color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{saldoInfo.label}</p>
                  <p className={`text-2xl font-bold ${saldoInfo.color}`}>
                    {fmt(Math.abs(saldo))}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Créditos (loja)</p>
                  <p className="font-semibold text-red-600">{fmt(totalCreditos)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Débitos (loja)</p>
                  <p className="font-semibold text-green-600">{fmt(totalDebitos)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Botão novo lançamento ── */}
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2 w-full">
              <Plus className="h-4 w-4" />
              Novo Lançamento
            </Button>
          ) : (
            <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
              <p className="font-semibold text-sm">Novo Lançamento</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo *</Label>
                  <Select value={form.tipo} onValueChange={v => set('tipo', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credito">
                        Crédito — despachante deve à loja
                      </SelectItem>
                      <SelectItem value="debito">
                        Débito — loja deve ao despachante
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Data *</Label>
                  <Input type="date" value={form.data} onChange={e => set('data', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <Label className="text-xs">Descrição *</Label>
                  <Input
                    placeholder="Ex: DUT adiantado pela loja, Comissão pendente..."
                    value={form.descricao}
                    onChange={e => set('descricao', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Valor (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={form.valor || ''}
                    onChange={e => set('valor', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setForm(formInicial) }}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSalvar}
                  disabled={saving || !form.descricao.trim() || form.valor <= 0}
                >
                  {saving ? 'Salvando...' : 'Registrar'}
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* ── Histórico de lançamentos ── */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              Histórico de Lançamentos
            </p>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : lancamentos.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Nenhum lançamento registrado ainda
              </div>
            ) : (
              <div className="space-y-2">
                {lancamentos.map(l => (
                  <LancamentoRow key={l.id} lancamento={l} onDelete={() => setDeleteId(l.id)} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={o => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Este lançamento será removido e o saldo será recalculado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleExcluir}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Linha de lançamento ──────────────────────────────────────────────────────
function LancamentoRow({ lancamento: l, onDelete }: { lancamento: CreditoLoja; onDelete: () => void }) {
  const isCredito = l.tipo === 'credito'
  const dataFmt = new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')
  const valorFmt = l.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm ${
      isCredito ? 'border-red-100 bg-red-50/50' : 'border-green-100 bg-green-50/50'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {isCredito
          ? <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
          : <TrendingUp   className="h-4 w-4 text-green-600 shrink-0" />
        }
        <div className="min-w-0">
          <p className="font-medium truncate">{l.descricao}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{dataFmt}</span>
            {l.processo && (
              <>
                <span>·</span>
                <span>Processo #{l.processo.numero_protocolo}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge className={isCredito
          ? 'bg-red-100 text-red-700 border-red-200'
          : 'bg-green-100 text-green-700 border-green-200'
        }>
          {isCredito ? '−' : '+'} {valorFmt}
        </Badge>
        <Button
          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
