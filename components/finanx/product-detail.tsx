"use client"

import { ArrowLeft, Pencil, Ban, Hash, Tag, Percent, Boxes, Coins, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge, StockIndicator } from "@/components/finanx/status-badge"
import { ProductImage } from "@/components/finanx/product-card"
import { StockChart } from "@/components/finanx/stock-chart"
import { type Product, formatCurrency, formatDate, stockLevel } from "@/lib/finanx-data"

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function ProductDetail({
  product,
  onBack,
  onEdit,
  onInactivate,
}: {
  product: Product
  onBack: () => void
  onEdit: (p: Product) => void
  onInactivate: (p: Product) => void
}) {
  const level = stockLevel(product)
  const margin = product.price - product.cost
  const marginPct = product.price > 0 ? Math.round((margin / product.price) * 100) : 0
  const isService = product.category === "Servicios"

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="lg" onClick={() => onEdit(product)}>
            <Pencil className="size-4" />
            Editar
          </Button>
          {product.estado === "active" && (
            <Button variant="destructive" size="lg" onClick={() => onInactivate(product)}>
              <Ban className="size-4" />
              Inactivar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* CU7 · Product card */}
        <section className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-1">
          <div className="relative">
            <ProductImage
              category={product.category}
              className="h-48 w-full"
              iconClassName="size-16"
            />
            <div className="absolute left-3 top-3">
              <StatusBadge estado={product.estado} />
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                {product.code}
              </span>
              <span className="text-[11px] text-muted-foreground">{product.category}</span>
            </div>
            <h1 className="mt-2 text-lg font-semibold leading-snug text-foreground">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-bold text-foreground">
              {formatCurrency(product.price)}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Stock actual</span>
              {isService ? (
                <span className="text-xs font-medium text-muted-foreground">No aplica</span>
              ) : (
                <StockIndicator level={level} stock={product.stock} />
              )}
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-card-foreground">Detalle del producto</h2>
          <div className="mt-1 grid divide-y divide-border sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
            <Spec icon={Hash} label="Código" value={product.code} />
            <Spec icon={Tag} label="Categoría" value={product.category} />
            <Spec icon={Coins} label="Costo" value={formatCurrency(product.cost)} />
            <Spec
              icon={Coins}
              label="Margen"
              value={`${formatCurrency(margin)} (${marginPct}%)`}
            />
            <Spec icon={Percent} label="IVA" value={`${product.iva}%`} />
            <Spec
              icon={Boxes}
              label="Stock mínimo"
              value={`${product.stockMin} uds`}
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            <History className="size-3.5" />
            Modificado el {formatDate(product.lastModifiedAt)} por {product.lastModifiedBy}
          </div>
        </section>
      </div>

      {/* CU7 · Stock movement chart */}
      {!isService && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-foreground">
            Movimiento de stock · últimos 30 días
          </h2>
          <p className="mb-4 mt-0.5 text-xs text-muted-foreground">
            Entradas y salidas netas de inventario por día.
          </p>
          <StockChart data={product.movement} />
        </section>
      )}
    </div>
  )
}
