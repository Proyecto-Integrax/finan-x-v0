"use client"

import { ArrowLeft, Download, AlertTriangle, CheckCircle2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoicePreview } from "@/components/finanx/invoice-preview"
import {
  type Factura,
  amountPaid,
  daysOverdue,
  effectiveFacturaStatus,
  formatCurrency,
  formatDate,
  moraInterest,
  orderTotals,
} from "@/lib/finanx-data"

export function InvoiceClientView({
  factura,
  onBack,
  onDownload,
}: {
  factura: Factura
  onBack: () => void
  onDownload: (f: Factura) => void
}) {
  const status = effectiveFacturaStatus(factura)
  const overdue = status === "VENCIDA"
  const mora = overdue ? moraInterest(factura) : 0
  const totals = orderTotals(factura.lines)
  const paid = amountPaid(factura)
  const balance = totals.total + mora - paid

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-foreground">
            Factura {factura.number ?? "(borrador)"}
          </h1>
          <p className="text-sm text-muted-foreground">Vista del cliente · solo lectura</p>
        </div>
        <Button size="lg" onClick={() => onDownload(factura)}>
          <Download className="size-4" />
          Descargar PDF
        </Button>
      </div>

      {/* Overdue banner */}
      {overdue && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-destructive">Esta factura está vencida</p>
            <p className="mt-0.5 text-sm text-foreground">
              Venció hace {daysOverdue(factura.dueDate)} días. Intereses por mora acumulados:{" "}
              <strong>{formatCurrency(mora)}</strong> (tasa {factura.moraRate}% mensual).
            </p>
          </div>
        </div>
      )}

      {/* Paid confirmation */}
      {status === "PAGADA" && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-primary">Factura pagada en su totalidad</p>
            <p className="mt-0.5 text-sm text-foreground">
              Gracias. No tienes saldos pendientes por esta factura.
            </p>
          </div>
        </div>
      )}

      <InvoicePreview factura={factura} />

      {/* Payments applied */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="size-4" />
          </div>
          <h2 className="text-sm font-semibold text-card-foreground">Pagos aplicados</h2>
        </div>

        {factura.payments.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Método</th>
                  <th className="pb-2 font-medium">Referencia</th>
                  <th className="pb-2 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {factura.payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 text-muted-foreground">{formatDate(p.date)}</td>
                    <td className="py-2.5 text-foreground">{p.method}</td>
                    <td className="py-2.5 font-mono text-xs text-muted-foreground">
                      {p.reference}
                    </td>
                    <td className="py-2.5 text-right font-medium text-foreground">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No se han registrado pagos para esta factura.
          </p>
        )}

        {/* Balance summary */}
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Total facturado</dt>
            <dd className="font-medium text-foreground">{formatCurrency(totals.total)}</dd>
          </div>
          {mora > 0 && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Intereses por mora</dt>
              <dd className="font-medium text-destructive">{formatCurrency(mora)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Total pagado</dt>
            <dd className="font-medium text-foreground">− {formatCurrency(paid)}</dd>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2.5">
            <dt className="text-sm font-semibold text-foreground">Saldo pendiente</dt>
            <dd
              className={`text-lg font-bold ${balance > 0 ? "text-destructive" : "text-primary"}`}
            >
              {formatCurrency(Math.max(0, balance))}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
