"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Send, Ban, UserRound, Pencil } from "lucide-react"
import { Topbar } from "@/components/finanx/topbar"
import { Button } from "@/components/ui/button"
import { InvoicesList } from "@/components/finanx/invoices-list"
import { InvoiceGenerator } from "@/components/finanx/invoice-generator"
import { InvoicePreview } from "@/components/finanx/invoice-preview"
import { InvoiceClientView } from "@/components/finanx/invoice-client-view"
import { EmitInvoiceDialog, type EmitOptions } from "@/components/finanx/emit-invoice-dialog"
import { VoidInvoiceDialog } from "@/components/finanx/void-invoice-dialog"
import { FacturaStatusBadge } from "@/components/finanx/status-badge"
import { useToast } from "@/components/finanx/toast"
import {
  type Factura,
  facturas as seedFacturas,
  pedidos as seedPedidos,
  effectiveFacturaStatus,
  nextFacturaNumber,
} from "@/lib/finanx-data"

type View =
  | { name: "list" }
  | { name: "detail"; factura: Factura }
  | { name: "client"; factura: Factura }
  | { name: "create" }

export function InvoicesModule() {
  const { notify } = useToast()

  const [data, setData] = useState<Factura[]>(seedFacturas)
  const [view, setView] = useState<View>({ name: "list" })
  const [globalSearch, setGlobalSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [emitTarget, setEmitTarget] = useState<Factura | null>(null)
  const [voidTarget, setVoidTarget] = useState<Factura | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  // Confirmed orders that don't yet have an invoice.
  const confirmedOrders = useMemo(() => {
    const invoicedPedidoIds = new Set(data.map((f) => f.pedidoId))
    return seedPedidos.filter((p) => p.status === "CONFIRMADO" && !invoicedPedidoIds.has(p.id))
  }, [data])

  const refresh = (updated: Factura) =>
    setData((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))

  const handleSaveDraft = (draft: Factura) => {
    const created: Factura = { ...draft, id: `f-${Date.now()}`, status: "BORRADOR" }
    setData((prev) => [created, ...prev])
    setView({ name: "detail", factura: created })
    notify({
      variant: "success",
      title: "Borrador guardado",
      description: "La factura se guardó en estado BORRADOR.",
    })
  }

  // From the generator: create the invoice, then open the emit dialog.
  const handleGenerateAndEmit = (draft: Factura) => {
    const created: Factura = { ...draft, id: `f-${Date.now()}`, status: "BORRADOR" }
    setData((prev) => [created, ...prev])
    setView({ name: "detail", factura: created })
    setEmitTarget(created)
  }

  const handleConfirmEmit = (factura: Factura, options: EmitOptions) => {
    const number = factura.number ?? nextFacturaNumber(data)
    const updated: Factura = { ...factura, number, status: "EMITIDA" }
    refresh(updated)
    setView((v) =>
      (v.name === "detail" || v.name === "client") && v.factura.id === updated.id
        ? { ...v, factura: updated }
        : v,
    )
    setEmitTarget(null)
    notify({
      variant: "success",
      title: `Factura ${number} emitida`,
      description: options.sendEmail
        ? `Enviada por email a ${factura.clientEmail}.`
        : "La factura fue emitida correctamente.",
    })
  }

  const handleVoid = (factura: Factura, reason: string) => {
    const now = new Date().toISOString().slice(0, 10)
    const updated: Factura = {
      ...factura,
      status: "ANULADA",
      cancelReason: reason,
      cancelledAt: now,
    }
    refresh(updated)
    setView((v) =>
      (v.name === "detail" || v.name === "client") && v.factura.id === updated.id
        ? { ...v, factura: updated }
        : v,
    )
    setVoidTarget(null)
    notify({
      variant: "warning",
      title: `Factura ${factura.number ?? ""} anulada`,
      description: "Quedó registrada en el histórico contable.",
    })
  }

  const handleCreditNote = (factura: Factura) => {
    setVoidTarget(null)
    notify({
      variant: "success",
      title: "Nota de crédito generada",
      description: `Se creó una nota de crédito para compensar la factura ${factura.number ?? ""}.`,
    })
  }

  const handleDownload = (factura: Factura) => {
    notify({
      variant: "info",
      title: "Generando PDF",
      description: `La factura ${factura.number ?? "borrador"} se está descargando.`,
    })
  }

  const breadcrumb =
    view.name === "detail"
      ? (view.factura.number ?? "Borrador")
      : view.name === "client"
        ? `Vista cliente · ${view.factura.number ?? "Borrador"}`
        : view.name === "create"
          ? "Generar factura"
          : "Facturas"

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar
        root="Facturación"
        breadcrumb={breadcrumb}
        globalSearch={globalSearch}
        onGlobalSearch={setGlobalSearch}
        searchPlaceholder="Buscar factura por número o cliente..."
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {view.name === "list" && (
          <InvoicesList
            facturas={data}
            globalSearch={globalSearch}
            loading={loading}
            onNew={() => setView({ name: "create" })}
            onView={(f) => setView({ name: "detail", factura: f })}
            onClientView={(f) => setView({ name: "client", factura: f })}
            onEmit={setEmitTarget}
            onVoid={setVoidTarget}
          />
        )}

        {view.name === "create" && (
          <InvoiceGenerator
            confirmedOrders={confirmedOrders}
            onBack={() => setView({ name: "list" })}
            onSaveDraft={handleSaveDraft}
            onEmit={handleGenerateAndEmit}
          />
        )}

        {view.name === "detail" && (
          <InvoiceDetail
            factura={view.factura}
            onBack={() => setView({ name: "list" })}
            onClientView={(f) => setView({ name: "client", factura: f })}
            onEmit={setEmitTarget}
            onVoid={setVoidTarget}
          />
        )}

        {view.name === "client" && (
          <InvoiceClientView
            factura={view.factura}
            onBack={() => setView({ name: "list" })}
            onDownload={handleDownload}
          />
        )}
      </main>

      <EmitInvoiceDialog
        factura={emitTarget}
        existing={data}
        onClose={() => setEmitTarget(null)}
        onConfirm={handleConfirmEmit}
      />
      <VoidInvoiceDialog
        factura={voidTarget}
        onClose={() => setVoidTarget(null)}
        onVoid={handleVoid}
        onCreditNote={handleCreditNote}
      />
    </div>
  )
}

/* Internal admin detail wrapper around the printable preview. */
function InvoiceDetail({
  factura,
  onBack,
  onClientView,
  onEmit,
  onVoid,
}: {
  factura: Factura
  onBack: () => void
  onClientView: (f: Factura) => void
  onEmit: (f: Factura) => void
  onVoid: (f: Factura) => void
}) {
  const eff = effectiveFacturaStatus(factura)
  const canEmit = factura.status === "BORRADOR"
  const canVoid = eff === "EMITIDA" || eff === "VENCIDA" || eff === "PAGADA"

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-foreground">
            {factura.number ?? "Factura en borrador"}
          </h1>
          <p className="text-sm text-muted-foreground">Pedido de origen · {factura.pedidoId}</p>
        </div>
        <FacturaStatusBadge status={eff} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" onClick={() => onClientView(factura)}>
            <UserRound className="size-4" />
            Vista cliente
          </Button>
          {canEmit && (
            <Button size="lg" onClick={() => onEmit(factura)}>
              <Send className="size-4" />
              Emitir
            </Button>
          )}
          {canVoid && (
            <Button variant="destructive" size="lg" onClick={() => onVoid(factura)}>
              <Ban className="size-4" />
              Anular
            </Button>
          )}
        </div>
      </div>

      {factura.status === "ANULADA" && factura.cancelReason && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <Pencil className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-destructive">Motivo de anulación</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{factura.cancelReason}</p>
          </div>
        </div>
      )}

      <InvoicePreview factura={factura} />
    </div>
  )
}
