"use client"

import {
  ArrowLeft,
  Pencil,
  Ban,
  FileText,
  Building2,
  Hash,
  Calendar,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PedidoStatusBadge } from "@/components/finanx/status-badge"
import { cn } from "@/lib/utils"
import {
  type Pedido,
  type PedidoStatus,
  formatCurrency,
  formatDate,
  orderTotals,
} from "@/lib/finanx-data"

const flow: { key: PedidoStatus; label: string }[] = [
  { key: "BORRADOR", label: "Creado" },
  { key: "CONFIRMADO", label: "Confirmado" },
  { key: "FACTURADO", label: "Facturado" },
  { key: "PAGADO", label: "Pagado" },
]

function timelineState(pedido: Pedido) {
  if (pedido.status === "CANCELADO") return -1
  return flow.findIndex((f) => f.key === pedido.status)
}

export function OrderDetail({
  pedido,
  onBack,
  onEdit,
  onCancel,
}: {
  pedido: Pedido
  onBack: () => void
  onEdit: (p: Pedido) => void
  onCancel: (p: Pedido) => void
}) {
  const totals = orderTotals(pedido.lines)
  const currentStep = timelineState(pedido)
  const cancelled = pedido.status === "CANCELADO"
  const editable = pedido.status === "BORRADOR" || pedido.status === "CONFIRMADO"

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">{pedido.id}</h1>
            <p className="text-sm text-muted-foreground">
              Creado el {formatDate(pedido.createdAt)}
            </p>
          </div>
        </div>
        <PedidoStatusBadge status={pedido.status} />
        {editable && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="lg" onClick={() => onEdit(pedido)}>
              <Pencil className="size-4" />
              Modificar
            </Button>
            <Button variant="destructive" size="lg" onClick={() => onCancel(pedido)}>
              <Ban className="size-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-card-foreground">Estado del pedido</h2>
        {cancelled ? (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
              <X className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">Pedido cancelado</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {pedido.cancelledAt && `Cancelado el ${formatDate(pedido.cancelledAt)}. `}
                {pedido.cancelReason}
              </p>
            </div>
          </div>
        ) : (
          <ol className="mt-6 flex items-center">
            {flow.map((step, i) => {
              const done = i <= currentStep
              const isCurrent = i === currentStep
              const lineDone = i < currentStep
              return (
                <li
                  key={step.key}
                  className={cn("flex items-center", i < flow.length - 1 && "flex-1")}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "grid size-9 place-items-center rounded-full border-2 transition-colors",
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground",
                        isCurrent && "ring-4 ring-primary/15",
                      )}
                    >
                      {done ? (
                        <Check className="size-4" />
                      ) : (
                        <span className="text-xs font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < flow.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                        lineDone ? "bg-primary" : "bg-border",
                      )}
                      aria-hidden
                    />
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Productos */}
        <section className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-card-foreground">Productos del pedido</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Producto</th>
                <th className="px-5 py-2.5 text-center font-medium">Cant.</th>
                <th className="px-5 py-2.5 text-right font-medium">Precio</th>
                <th className="px-5 py-2.5 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.lines.map((l) => (
                <tr key={l.productId} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{l.name}</p>
                    <span className="font-mono text-[11px] text-muted-foreground">{l.code}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-muted-foreground">{l.quantity}</td>
                  <td className="px-5 py-3 text-right text-muted-foreground">
                    {formatCurrency(l.price)}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">
                    {formatCurrency(l.price * l.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Resumen + cliente */}
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-card-foreground">Cliente</h2>
            <div className="mt-3 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{pedido.clientName}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Hash className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">NIT {pedido.clientNit}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{formatDate(pedido.createdAt)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-card-foreground">Totales</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">{formatCurrency(totals.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">IVA</dt>
                <dd className="font-medium text-foreground">{formatCurrency(totals.iva)}</dd>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5">
                <dt className="text-sm font-semibold text-foreground">TOTAL</dt>
                <dd className="text-lg font-bold text-primary">{formatCurrency(totals.total)}</dd>
              </div>
            </dl>
          </section>

          {pedido.invoiceId && (
            <section className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-success/10 text-success">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Factura asociada</p>
                  <p className="text-sm font-semibold text-foreground">{pedido.invoiceId}</p>
                </div>
              </div>
              <Button variant="link" size="sm" className="px-0">
                Ver factura
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
