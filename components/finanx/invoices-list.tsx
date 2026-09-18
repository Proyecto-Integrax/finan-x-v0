"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  Eye,
  Send,
  Ban,
  UserRound,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  SearchX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FacturaStatusBadge } from "@/components/finanx/status-badge"
import { cn } from "@/lib/utils"
import {
  type Factura,
  type FacturaStatus,
  facturaStatuses,
  clients as allClients,
  effectiveFacturaStatus,
  formatCurrency,
  formatDate,
  orderTotals,
} from "@/lib/finanx-data"

const PAGE_SIZE = 6

export function InvoicesList({
  facturas,
  globalSearch,
  loading,
  onNew,
  onView,
  onClientView,
  onEmit,
  onVoid,
}: {
  facturas: Factura[]
  globalSearch: string
  loading: boolean
  onNew: () => void
  onView: (f: Factura) => void
  onClientView: (f: Factura) => void
  onEmit: (f: Factura) => void
  onVoid: (f: Factura) => void
}) {
  const [clientFilter, setClientFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<FacturaStatus | "all">("all")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const g = globalSearch.trim().toLowerCase()
    return facturas.filter((f) => {
      const eff = effectiveFacturaStatus(f)
      const matchesGlobal =
        !g ||
        (f.number ?? "").toLowerCase().includes(g) ||
        f.clientName.toLowerCase().includes(g) ||
        f.clientNit.toLowerCase().includes(g) ||
        f.pedidoId.toLowerCase().includes(g)
      const matchesClient = clientFilter === "all" || f.clientId === clientFilter
      const matchesStatus = statusFilter === "all" || eff === statusFilter
      return matchesGlobal && matchesClient && matchesStatus
    })
  }, [facturas, globalSearch, clientFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const hasFilters = clientFilter !== "all" || statusFilter !== "all" || globalSearch

  const resetFilters = () => {
    setClientFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  const inputCls =
    "h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Facturación</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Genera, emite y controla las facturas electrónicas de FINAN-X.
          </p>
        </div>
        <Button size="lg" onClick={onNew}>
          <Plus className="size-4" />
          Generar Factura
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Filtros
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={clientFilter}
            onChange={(e) => {
              setClientFilter(e.target.value)
              setPage(1)
            }}
            className={inputCls}
            aria-label="Filtrar por cliente"
          >
            <option value="all">Todos los clientes</option>
            {allClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.razonSocial}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as FacturaStatus | "all")
              setPage(1)
            }}
            className={inputCls}
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            {facturaStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">N.º factura</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Emisión</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageItems.length > 0 ? (
                pageItems.map((f) => {
                  const total = orderTotals(f.lines).total
                  const eff = effectiveFacturaStatus(f)
                  const canEmit = f.status === "BORRADOR"
                  const canVoid = eff === "EMITIDA" || eff === "VENCIDA" || eff === "PAGADA"
                  return (
                    <tr
                      key={f.id}
                      className="group border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onView(f)}
                          className="font-mono font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {f.number ?? "— Borrador"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{f.clientName}</p>
                        <span className="text-xs text-muted-foreground">NIT {f.clientNit}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(f.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(f.dueDate)}</td>
                      <td className="px-4 py-3">
                        <FacturaStatusBadge status={eff} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onView(f)}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            aria-label={`Ver ${f.number ?? "borrador"}`}
                            title="Ver / gestionar"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => onClientView(f)}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            aria-label={`Vista cliente ${f.number ?? "borrador"}`}
                            title="Vista del cliente"
                          >
                            <UserRound className="size-4" />
                          </button>
                          <button
                            onClick={() => onEmit(f)}
                            disabled={!canEmit}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-success/10 hover:text-success disabled:pointer-events-none disabled:opacity-30"
                            aria-label={`Emitir ${f.number ?? "borrador"}`}
                            title={canEmit ? "Emitir" : "Ya emitida"}
                          >
                            <Send className="size-4" />
                          </button>
                          <button
                            onClick={() => onVoid(f)}
                            disabled={!canVoid}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                            aria-label={`Anular ${f.number ?? "borrador"}`}
                            title={canVoid ? "Anular" : "No anulable"}
                          >
                            <Ban className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                        {hasFilters ? <SearchX className="size-6" /> : <FileText className="size-6" />}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {hasFilters ? "No se encontraron facturas" : "Aún no hay facturas"}
                      </p>
                      <p className="max-w-xs text-xs text-muted-foreground">
                        {hasFilters
                          ? "Prueba ajustando o limpiando los filtros de búsqueda."
                          : "Genera una factura a partir de un pedido confirmado."}
                      </p>
                      {hasFilters ? (
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Limpiar filtros
                        </Button>
                      ) : (
                        <Button size="sm" onClick={onNew}>
                          <Plus className="size-4" />
                          Generar Factura
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pageItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Mostrando <strong className="text-foreground">{pageItems.length}</strong> de{" "}
              <strong className="text-foreground">{filtered.length}</strong> facturas
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "grid size-8 place-items-center rounded-lg text-sm font-medium transition-colors",
                      safePage === i + 1
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                    aria-current={safePage === i + 1 ? "page" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
