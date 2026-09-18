"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  Eye,
  Pencil,
  Ban,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ShoppingCart,
  SearchX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PedidoStatusBadge } from "@/components/finanx/status-badge"
import { cn } from "@/lib/utils"
import {
  type Pedido,
  type PedidoStatus,
  pedidoStatuses,
  clients as allClients,
  formatCurrency,
  formatDate,
  orderTotals,
} from "@/lib/finanx-data"

const PAGE_SIZE = 5

export function OrdersHistory({
  pedidos,
  globalSearch,
  loading,
  onNew,
  onView,
  onEdit,
  onCancel,
}: {
  pedidos: Pedido[]
  globalSearch: string
  loading: boolean
  onNew: () => void
  onView: (p: Pedido) => void
  onEdit: (p: Pedido) => void
  onCancel: (p: Pedido) => void
}) {
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<PedidoStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const g = globalSearch.trim().toLowerCase()
    return pedidos.filter((p) => {
      const matchesGlobal =
        !g ||
        p.id.toLowerCase().includes(g) ||
        p.clientName.toLowerCase().includes(g) ||
        p.clientNit.toLowerCase().includes(g)
      const matchesClient = clientFilter === "all" || p.clientId === clientFilter
      const matchesStatus = statusFilter === "all" || p.status === statusFilter
      const matchesDate = !dateFilter || p.createdAt === dateFilter
      return matchesGlobal && matchesClient && matchesStatus && matchesDate
    })
  }, [pedidos, globalSearch, clientFilter, statusFilter, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const hasFilters =
    clientFilter !== "all" || statusFilter !== "all" || dateFilter || globalSearch

  const resetFilters = () => {
    setClientFilter("all")
    setStatusFilter("all")
    setDateFilter("")
    setPage(1)
  }

  const inputCls =
    "h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Historial de Pedidos
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Consulta, filtra y gestiona todos los pedidos de FINAN-X.
          </p>
        </div>
        <Button size="lg" onClick={onNew}>
          <Plus className="size-4" />
          Registrar Pedido
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Filtros
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              setStatusFilter(e.target.value as PedidoStatus | "all")
              setPage(1)
            }}
            className={inputCls}
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            {pedidoStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value)
              setPage(1)
            }}
            className={cn(inputCls, "text-muted-foreground")}
            aria-label="Filtrar por fecha"
          />
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">N.º de pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageItems.length > 0 ? (
                pageItems.map((p) => {
                  const total = orderTotals(p.lines).total
                  const editable = p.status === "BORRADOR" || p.status === "CONFIRMADO"
                  return (
                    <tr
                      key={p.id}
                      className="group border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onView(p)}
                          className="font-mono font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {p.id}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{p.clientName}</p>
                        <span className="text-xs text-muted-foreground">NIT {p.clientNit}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3">
                        <PedidoStatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onView(p)}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                            aria-label={`Ver ${p.id}`}
                            title="Ver"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => onEdit(p)}
                            disabled={!editable}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                            aria-label={`Modificar ${p.id}`}
                            title={editable ? "Modificar" : "No modificable"}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => onCancel(p)}
                            disabled={!editable}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                            aria-label={`Cancelar ${p.id}`}
                            title={editable ? "Cancelar" : "No cancelable"}
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
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                        {hasFilters ? (
                          <SearchX className="size-6" />
                        ) : (
                          <ShoppingCart className="size-6" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {hasFilters
                          ? "No se encontraron pedidos"
                          : "Aún no hay pedidos registrados"}
                      </p>
                      <p className="max-w-xs text-xs text-muted-foreground">
                        {hasFilters
                          ? "Prueba ajustando o limpiando los filtros de búsqueda."
                          : "Registra tu primer pedido para comenzar a gestionarlo."}
                      </p>
                      {hasFilters ? (
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Limpiar filtros
                        </Button>
                      ) : (
                        <Button size="sm" onClick={onNew}>
                          <Plus className="size-4" />
                          Registrar Pedido
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
              <strong className="text-foreground">{filtered.length}</strong> pedidos
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
