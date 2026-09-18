import { Landmark } from "lucide-react"
import { QrCode } from "@/components/finanx/qr-code"
import {
  type Factura,
  company,
  formatCurrency,
  formatDate,
  orderTotals,
  effectiveFacturaStatus,
} from "@/lib/finanx-data"

const statusLabel: Record<string, string> = {
  BORRADOR: "BORRADOR",
  EMITIDA: "EMITIDA",
  PAGADA: "PAGADA",
  VENCIDA: "VENCIDA",
  ANULADA: "ANULADA",
}

/**
 * A4-styled printable invoice sheet. Always rendered on a light "paper"
 * surface regardless of the app theme so it reads as a real document.
 */
export function InvoicePreview({ factura }: { factura: Factura }) {
  const totals = orderTotals(factura.lines)
  const status = effectiveFacturaStatus(factura)
  const isDraft = factura.status === "BORRADOR"
  const isVoid = factura.status === "ANULADA"

  return (
    <div className="relative mx-auto w-full max-w-[820px] overflow-hidden rounded-lg bg-white text-neutral-800 shadow-xl ring-1 ring-black/5">
      {/* Watermark for non-final states */}
      {(isDraft || isVoid) && (
        <div
          className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
          aria-hidden
        >
          <span
            className={`select-none text-[120px] font-black uppercase tracking-widest opacity-[0.06] ${
              isVoid ? "text-red-600" : "text-neutral-900"
            }`}
            style={{ transform: "rotate(-24deg)" }}
          >
            {isVoid ? "Anulada" : "Borrador"}
          </span>
        </div>
      )}

      <div className="relative z-0 p-8 sm:p-10">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
          <div className="flex items-start gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-neutral-900 text-white">
              <Landmark className="size-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-neutral-900">{company.name}</p>
              <p className="text-xs text-neutral-500">NIT {company.nit}</p>
              <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-neutral-500">
                {company.address}
              </p>
              <p className="text-xs text-neutral-500">
                {company.phone} · {company.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Factura electrónica de venta
            </p>
            <p className="mt-1 font-mono text-xl font-bold text-neutral-900">
              {factura.number ?? "Sin asignar"}
            </p>
            <span
              className={`mt-2 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                status === "PAGADA"
                  ? "bg-blue-50 text-blue-700 ring-blue-200"
                  : status === "EMITIDA"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : status === "VENCIDA"
                      ? "bg-red-50 text-red-700 ring-red-200"
                      : status === "ANULADA"
                        ? "bg-neutral-100 text-neutral-500 ring-neutral-300"
                        : "bg-neutral-100 text-neutral-600 ring-neutral-300"
              }`}
            >
              {statusLabel[status]}
            </span>
          </div>
        </header>

        {/* Parties + meta */}
        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Facturar a
            </p>
            <p className="mt-1.5 font-semibold text-neutral-900">{factura.clientName}</p>
            <p className="text-sm text-neutral-500">NIT {factura.clientNit}</p>
            <p className="mt-1 max-w-[280px] text-sm leading-relaxed text-neutral-500">
              {factura.clientAddress}
            </p>
            <p className="text-sm text-neutral-500">{factura.clientEmail}</p>
          </div>
          <div className="sm:text-right">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4 sm:justify-end">
                <dt className="text-neutral-400">Fecha de emisión</dt>
                <dd className="min-w-[120px] font-medium text-neutral-800 sm:text-right">
                  {formatDate(factura.issueDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:justify-end">
                <dt className="text-neutral-400">Fecha de vencimiento</dt>
                <dd className="min-w-[120px] font-medium text-neutral-800 sm:text-right">
                  {formatDate(factura.dueDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:justify-end">
                <dt className="text-neutral-400">Pedido de origen</dt>
                <dd className="min-w-[120px] font-mono font-medium text-neutral-800 sm:text-right">
                  {factura.pedidoId}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Line items */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-neutral-200 text-left text-[11px] uppercase tracking-wider text-neutral-400">
              <th className="py-2.5 font-semibold">Descripción</th>
              <th className="py-2.5 text-center font-semibold">Cant.</th>
              <th className="py-2.5 text-right font-semibold">Precio unit.</th>
              <th className="py-2.5 text-right font-semibold">IVA</th>
              <th className="py-2.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {factura.lines.map((l) => (
              <tr key={l.productId} className="border-b border-neutral-100">
                <td className="py-3 pr-2">
                  <p className="font-medium text-neutral-900">{l.name}</p>
                  <span className="font-mono text-[11px] text-neutral-400">{l.code}</span>
                </td>
                <td className="py-3 text-center text-neutral-600">{l.quantity}</td>
                <td className="py-3 text-right text-neutral-600">{formatCurrency(l.price)}</td>
                <td className="py-3 text-right text-neutral-500">{l.iva}%</td>
                <td className="py-3 text-right font-medium text-neutral-900">
                  {formatCurrency(l.price * l.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals + QR */}
        <section className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <QrCode value={factura.verificationCode} size={104} />
            <div className="max-w-[220px]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Verificación DIAN
              </p>
              <p className="mt-1 break-all font-mono text-[10px] leading-relaxed text-neutral-500">
                {factura.verificationCode}
              </p>
              <p className="mt-1 text-[10px] text-neutral-400">
                Escanea el código para validar la autenticidad de esta factura.
              </p>
            </div>
          </div>

          <dl className="w-full space-y-2 text-sm sm:w-[280px]">
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd className="font-medium text-neutral-800">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">IVA (19%)</dt>
              <dd className="font-medium text-neutral-800">{formatCurrency(totals.iva)}</dd>
            </div>
            <div className="mt-1 flex items-center justify-between border-t-2 border-neutral-900 pt-2.5">
              <dt className="text-base font-bold text-neutral-900">TOTAL</dt>
              <dd className="text-xl font-bold text-neutral-900">
                {formatCurrency(totals.total)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-neutral-200 pt-4 text-center text-[11px] text-neutral-400">
          <p>
            {company.regime} · {company.website}
          </p>
          <p className="mt-0.5">
            Esta factura se asimila en sus efectos a una letra de cambio (Art. 774 C.Co.).
          </p>
        </footer>
      </div>
    </div>
  )
}
