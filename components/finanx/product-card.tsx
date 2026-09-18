"use client"

import { Monitor, Briefcase, Home, Wrench, Headphones, Package, Eye, Pencil, Ban } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { StatusBadge, StockIndicator } from "@/components/finanx/status-badge"
import { cn } from "@/lib/utils"
import { type Product, type ProductCategory, formatCurrency, stockLevel } from "@/lib/finanx-data"

export const categoryVisual: Record<ProductCategory, { icon: LucideIcon; gradient: string }> = {
  Electrónica: { icon: Monitor, gradient: "from-sky-500/25 to-blue-600/25" },
  Oficina: { icon: Briefcase, gradient: "from-violet-500/25 to-indigo-600/25" },
  Hogar: { icon: Home, gradient: "from-emerald-500/25 to-teal-600/25" },
  Industrial: { icon: Wrench, gradient: "from-amber-500/25 to-orange-600/25" },
  Servicios: { icon: Headphones, gradient: "from-rose-500/25 to-pink-600/25" },
}

export function ProductImage({
  category,
  className,
  iconClassName,
}: {
  category: ProductCategory
  className?: string
  iconClassName?: string
}) {
  const visual = categoryVisual[category] ?? { icon: Package, gradient: "from-muted to-muted" }
  const Icon = visual.icon
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden bg-gradient-to-br",
        visual.gradient,
        className,
      )}
      aria-hidden
    >
      <Icon className={cn("text-foreground/40", iconClassName)} />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)] opacity-40 dark:opacity-10" />
    </div>
  )
}

export function ProductCard({
  product,
  onView,
  onEdit,
  onInactivate,
}: {
  product: Product
  onView: (p: Product) => void
  onEdit: (p: Product) => void
  onInactivate: (p: Product) => void
}) {
  const level = stockLevel(product)
  const isService = product.category === "Servicios"

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative">
        <button
          onClick={() => onView(product)}
          className="block w-full"
          aria-label={`Ver ${product.name}`}
        >
          <ProductImage
            category={product.category}
            className="h-36 w-full"
            iconClassName="size-12"
          />
        </button>
        <div className="absolute left-3 top-3">
          <StatusBadge estado={product.estado} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
            {product.code}
          </span>
          <span className="text-[11px] text-muted-foreground">{product.category}</span>
        </div>

        <button
          onClick={() => onView(product)}
          className="mt-2 text-left text-sm font-semibold leading-snug text-foreground hover:text-primary"
        >
          {product.name}
        </button>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Precio</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(product.price)}</p>
          </div>
          {!isService && <StockIndicator level={level} stock={product.stock} />}
        </div>

        <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
          <button
            onClick={() => onView(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Eye className="size-3.5" />
            Ver
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="size-3.5" />
            Editar
          </button>
          <button
            onClick={() => onInactivate(product)}
            disabled={product.estado === "inactive"}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
          >
            <Ban className="size-3.5" />
            Inactivar
          </button>
        </div>
      </div>
    </div>
  )
}
