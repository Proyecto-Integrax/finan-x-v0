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
