import { cn } from "@/lib/utils"
import type { StockLevel } from "@/lib/finanx-data"

const orderStatusStyles: Record<string, string> = {
  Pagado: "bg-success/10 text-success ring-success/20",
  Pendiente: "bg-warning/15 text-warning-foreground ring-warning/30",
  Anulado: "bg-muted text-muted-foreground ring-border",
}

export function StatusBadge({ estado }: { estado: "active" | "inactive" }) {
  const active = estado === "active"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        active
          ? "bg-success/10 text-success ring-success/20"
          : "bg-muted text-muted-foreground ring-border",
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", active ? "bg-success" : "bg-muted-foreground")}
        aria-hidden
      />
      {active ? "Activo" : "Inactivo"}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        orderStatusStyles[status] ?? orderStatusStyles.Anulado,
      )}
    >
      {status}
    </span>
  )
}

const pedidoStatusStyles: Record<string, { label: string; cls: string }> = {
  BORRADOR: { label: "Borrador", cls: "bg-muted text-muted-foreground ring-border" },
  CONFIRMADO: { label: "Confirmado", cls: "bg-primary/10 text-primary ring-primary/20" },
  FACTURADO: { label: "Facturado", cls: "bg-success/10 text-success ring-success/20" },
  PAGADO: { label: "Pagado", cls: "bg-success/10 text-success ring-success/20" },
  CANCELADO: { label: "Cancelado", cls: "bg-destructive/10 text-destructive ring-destructive/20" },
}

export function PedidoStatusBadge({ status }: { status: string }) {
  const c = pedidoStatusStyles[status] ?? pedidoStatusStyles.BORRADOR
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        c.cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {c.label}
    </span>
  )
}

const facturaStatusStyles: Record<string, { label: string; cls: string }> = {
  BORRADOR: { label: "Borrador", cls: "bg-muted text-muted-foreground ring-border" },
  EMITIDA: { label: "Emitida", cls: "bg-success/10 text-success ring-success/20" },
  PAGADA: { label: "Pagada", cls: "bg-primary/10 text-primary ring-primary/20" },
  VENCIDA: { label: "Vencida", cls: "bg-destructive/10 text-destructive ring-destructive/20" },
  ANULADA: { label: "Anulada", cls: "bg-muted text-muted-foreground ring-border line-through" },
}

export function FacturaStatusBadge({ status }: { status: string }) {
  const c = facturaStatusStyles[status] ?? facturaStatusStyles.BORRADOR
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        c.cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {c.label}
    </span>
  )
}

const stockConfig: Record<
  StockLevel,
  { label: string; dot: string; text: string; ring: string; bg: string }
> = {
  ok: {
    label: "Suficiente",
    dot: "bg-success",
    text: "text-success",
    ring: "ring-success/20",
    bg: "bg-success/10",
  },
  low: {
    label: "Stock bajo",
    dot: "bg-warning",
    text: "text-warning-foreground",
    ring: "ring-warning/30",
    bg: "bg-warning/15",
  },
  out: {
    label: "Agotado",
    dot: "bg-destructive",
    text: "text-destructive",
    ring: "ring-destructive/20",
    bg: "bg-destructive/10",
  },
}

export function StockIndicator({
  level,
  stock,
  showCount = true,
}: {
  level: StockLevel
  stock: number
  showCount?: boolean
}) {
  const c = stockConfig[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        c.bg,
        c.text,
        c.ring,
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} aria-hidden />
      {showCount ? `${stock} · ${c.label}` : c.label}
    </span>
  )
}
