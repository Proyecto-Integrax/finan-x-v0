"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Save, Send, Search, PackageCheck, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoicePreview } from "@/components/finanx/invoice-preview"
import { cn } from "@/lib/utils"
import {
  type Factura,
  type Pedido,
  TODAY,
  clients as allClients,
  formatCurrency,
  formatDate,
  makeVerificationCode,
  orderTotals,
} from "@/lib/finanx-data"

/** Add `days` to an ISO date and return an ISO date string. */
function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function draftFromPedido(pedido: Pedido): Factura {
  const client = allClients.find((c) => c.id === pedido.clientId)
  return {
    id: `draft-${pedido.id}`,
    pedidoId: pedido.id,
    clientId: pedido.clientId,
    clientName: pedido.clientName,
    clientNit: pedido.clientNit,
    clientEmail: client?.correo ?? "",
    clientAddress: client?.direccion ?? "",
    issueDate: TODAY,
    dueDate: addDays(TODAY, 30),
    status: "BORRADOR",
    lines: pedido.lines,
    payments: [],
    moraRate: 2.5,
    verificationCode: makeVerificationCode(
      Number.parseInt(pedido.id.replace(/\D/g, ""), 10) + 700,
    ),
  }
}

export function InvoiceGenerator({
  confirmedOrders,
  onBack,
  onSaveDraft,
  onEmit,
}: {
  confirmedOrders: Pedido[]
  onBack: () => void
  onSaveDraft: (draft: Factura) => void
  onEmit: (draft: Factura) => void
}) {
  const [selectedId, setSelectedId] = useState<string>(confirmedOrders[0]?.id ?? "")
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return confirmedOrders
    return confirmedOrders.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.clientNit.toLowerCase().includes(q),
    )
  }, [confirmedOrders, query])

  const selected = confirmedOrders.find((p) => p.id === selectedId) ?? null
  const draft = selected ? draftFromPedido(selected) : null

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-foreground">Generar factura</h1>
          <p className="text-sm text-muted-foreground">
            Selecciona un pedido confirmado para generar su factura.
          </p>
        </div>
        {draft && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" onClick={() => onSaveDraft(draft)}>
              <Save className="size-4" />
              Guardar Borrador
            </Button>
            <Button size="lg" onClick={() => onEmit(draft)}>
              <Send className="size-4" />
              Emitir Factura
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Order selector */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-card-foreground">Pedidos confirmados</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Solo los pedidos en estado CONFIRMADO pueden facturarse.
            </p>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pedido o cliente..."
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <div className="mt-3 space-y-2">
              {results.length > 0 ? (
                results.map((p) => {
                  const total = orderTotals(p.lines).total
                  const active = p.id === selectedId
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                        active
                          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <div
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-lg",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <PackageCheck className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-medium text-foreground">{p.id}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.clientName}</p>
                        <p className="mt-0.5 text-xs font-medium text-foreground">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </button>
                  )
                })
              ) : (
                <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                  No hay pedidos confirmados disponibles.
                </p>
              )}
            </div>
          </section>

          {draft && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-card-foreground">Condiciones</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Emisión</dt>
                  <dd className="font-medium text-foreground">{formatDate(draft.issueDate)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Vencimiento</dt>
                  <dd className="font-medium text-foreground">{formatDate(draft.dueDate)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Plazo</dt>
                  <dd className="font-medium text-foreground">30 días</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 p-2.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                El número correlativo se asigna solo al emitir la factura.
              </div>
            </section>
          )}
        </aside>

        {/* Live preview */}
        <div className="min-w-0">
          {draft ? (
            <InvoicePreview factura={draft} />
          ) : (
            <div className="grid h-full min-h-[320px] place-items-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                  <PackageCheck className="size-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Selecciona un pedido confirmado
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  La vista previa de la factura aparecerá aquí.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
