import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAgenda } from "@/hooks/useAgenda"
import { useCompromissos, Compromisso } from "@/hooks/useCompromissos"
import { AgendaHeader } from "@/components/agenda/AgendaHeader"
import { AgendaCard } from "@/components/agenda/AgendaCard"
import { CompromissoCard } from "@/components/agenda/CompromissoCard"
import { CompromissoModal } from "@/components/agenda/CompromissoModal"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, CalendarDays, ClipboardList } from "lucide-react"

export default function Agenda() {
  const {
    items,
    stats,
    loading: loadingPrazos,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    getItemsForDate,
  } = useAgenda()

  const {
    loading: loadingCompromissos,
    getCompromissosForDate,
    deleteCompromisso,
    concluirCompromisso,
    datasComCompromisso,
  } = useCompromissos()

  const [modalOpen, setModalOpen] = useState(false)
  const [compromissoEditando, setCompromissoEditando] = useState<Compromisso | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null)

  const abrirNovoCompromisso = () => {
    setCompromissoEditando(null)
    setModalOpen(true)
  }

  const abrirEdicao = (c: Compromisso) => {
    setCompromissoEditando(c)
    setModalOpen(true)
  }

  const pedirExclusao = (id: string) => {
    setIdParaExcluir(id)
    setDeleteDialogOpen(true)
  }

  const confirmarExclusao = async () => {
    if (idParaExcluir) {
      await deleteCompromisso(idParaExcluir)
      setDeleteDialogOpen(false)
      setIdParaExcluir(null)
    }
  }

  // ─── Calendário compartilhado ─────────────────────────────────────────────

  const CalendarioLateral = () => (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-base">Calendário</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={date => date && setSelectedDate(date)}
          className="rounded-md border"
          locale={ptBR}
          modifiers={{
            temPrazo: items.map(i => new Date(i.prazo)),
            prazoCritico: items.filter(i => i.isCritico).map(i => new Date(i.prazo)),
            prazoVencido: items.filter(i => i.diasRestantes < 0).map(i => new Date(i.prazo)),
            temCompromisso: datasComCompromisso,
          }}
          modifiersStyles={{
            temPrazo: { fontWeight: 'bold' },
            prazoCritico: { backgroundColor: 'hsl(var(--warning) / 0.2)', color: 'hsl(var(--warning))' },
            prazoVencido: { backgroundColor: 'hsl(var(--destructive) / 0.2)', color: 'hsl(var(--destructive))' },
            temCompromisso: { textDecoration: 'underline', textDecorationColor: 'hsl(var(--primary))' },
          }}
        />
        {/* Legenda */}
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-warning/20 border border-warning/30" />
            Prazo crítico (≤ 3 dias)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/30" />
            Prazo vencido
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm underline decoration-primary" />
            <span className="underline decoration-primary">Com compromisso</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ─── Aba Prazos ───────────────────────────────────────────────────────────

  const renderPrazosMonthView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CalendarioLateral />
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Prazos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPrazos ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {getItemsForDate(selectedDate).map(item => (
                  <AgendaCard key={item.id} item={item} />
                ))}
                {getItemsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum prazo agendado para este dia
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderPrazosWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { locale: ptBR })
    const weekEnd = endOfWeek(selectedDate, { locale: ptBR })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map(day => {
          const dayItems = getItemsForDate(day)
          const isCurrentMonth = isSameMonth(day, selectedDate)
          return (
            <Card key={day.toISOString()} className={!isCurrentMonth ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{format(day, 'EEE', { locale: ptBR })}</span>
                  <span className="text-muted-foreground">{format(day, 'dd')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingPrazos ? (
                  <Skeleton className="h-16 w-full" />
                ) : (
                  <>
                    {dayItems.slice(0, 3).map(item => (
                      <div
                        key={item.id}
                        className={`p-2 rounded text-xs border-l-2 cursor-pointer ${
                          item.diasRestantes < 0
                            ? 'border-l-destructive bg-destructive/10'
                            : item.isCritico
                              ? 'border-l-warning bg-warning/10'
                              : 'border-l-primary bg-primary/10'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="font-medium truncate">{item.numeroProtocolo}</div>
                        <div className="text-muted-foreground truncate">{item.clienteNome}</div>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{dayItems.length - 3} mais
                      </div>
                    )}
                    {dayItems.length === 0 && isCurrentMonth && (
                      <div className="text-xs text-muted-foreground text-center py-4">Sem prazos</div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderPrazosDayView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Prazos para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingPrazos ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {getItemsForDate(selectedDate).map(item => (
              <AgendaCard key={item.id} item={item} />
            ))}
            {getItemsForDate(selectedDate).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum prazo para este dia.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  // ─── Aba Compromissos ─────────────────────────────────────────────────────

  const compromissosDoDia = getCompromissosForDate(selectedDate)

  const renderCompromissosView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CalendarioLateral />
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Compromissos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h2>
          <Button size="sm" onClick={abrirNovoCompromisso} className="gap-1">
            <Plus className="h-4 w-4" />
            Novo Compromisso
          </Button>
        </div>

        {loadingCompromissos ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : compromissosDoDia.length > 0 ? (
          <div className="space-y-3">
            {compromissosDoDia.map(c => (
              <CompromissoCard
                key={c.id}
                compromisso={c}
                onEdit={abrirEdicao}
                onDelete={pedirExclusao}
                onConcluir={concluirCompromisso}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground opacity-40" />
              <p className="text-muted-foreground text-sm">
                Nenhum compromisso para este dia.
              </p>
              <Button size="sm" variant="outline" onClick={abrirNovoCompromisso} className="gap-1">
                <Plus className="h-4 w-4" />
                Agendar compromisso
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  // ─── Render principal ─────────────────────────────────────────────────────

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AgendaHeader
        stats={stats}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedDate={selectedDate}
        loading={loadingPrazos}
      />

      <Tabs defaultValue="prazos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prazos" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Prazos
            {stats.prazosCriticos > 0 && (
              <Badge variant="secondary" className="ml-1 bg-warning/20 text-warning text-xs px-1.5">
                {stats.prazosCriticos}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compromissos" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Compromissos
          </TabsTrigger>
        </TabsList>

        {/* ── Aba Prazos ── */}
        <TabsContent value="prazos" className="space-y-0">
          {viewMode === 'month' && renderPrazosMonthView()}
          {viewMode === 'week' && renderPrazosWeekView()}
          {viewMode === 'day' && renderPrazosDayView()}
        </TabsContent>

        {/* ── Aba Compromissos ── */}
        <TabsContent value="compromissos" className="space-y-0">
          {renderCompromissosView()}
        </TabsContent>
      </Tabs>

      {/* Modal criar/editar compromisso */}
      <CompromissoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDate={selectedDate}
        compromisso={compromissoEditando}
      />

      {/* Dialog confirmar exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir compromisso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
