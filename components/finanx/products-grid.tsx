"use client"

import { useMemo, useState } from "react"
import { Plus, SlidersHorizontal, Package, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/finanx/product-card"
import {
  type Product,
  type ProductStatus,
  type ProductCategory,
  productCategories,
  stockLevel,
} from "@/lib/finanx-data"

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="h-36 w-full animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function ProductsGrid({
  products,
  globalSearch,
  loading,
  onNew,
  onView,
  onEdit,
  onInactivate,
}: {
  products: Product[]
  globalSearch: string
  loading: boolean
  onNew: () => void
  onView: (p: Product) => void
  onEdit: (p: Product) => void
  onInactivate: (p: Product) => void
}) {
  const [codeFilter, setCodeFilter] = useState("")
  const [nameFilter, setNameFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all")
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all")
  const [stockFilter, setStockFilter] = useState<"all" | "ok" | "low" | "out">("all")

  const filtered = useMemo(() => {
    const g = globalSearch.trim().toLowerCase()
    return products.filter((p) => {
      const matchesGlobal =
        !g || p.code.toLowerCase().includes(g) || p.name.toLowerCase().includes(g)
      const matchesCode = !codeFilter || p.code.toLowerCase().includes(codeFilter.toLowerCase())
      const matchesName = !nameFilter || p.name.toLowerCase().includes(nameFilter.toLowerCase())
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
      const matchesStatus = statusFilter === "all" || p.estado === statusFilter
      const matchesStock = stockFilter === "all" || stockLevel(p) === stockFilter
      return (
        matchesGlobal &&
        matchesCode &&
        matchesName &&
        matchesCategory &&
        matchesStatus &&
        matchesStock
      )
    })
  }, [products, globalSearch, codeFilter, nameFilter, categoryFilter, statusFilter, stockFilter])

  const hasFilters =
    codeFilter ||
    nameFilter ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    stockFilter !== "all" ||
    globalSearch

  const resetFilters = () => {
    setCodeFilter("")
    setNameFilter("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setStockFilter("all")
  }

  const inputCls =
    "h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Gestión de Productos
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Administra el catálogo, precios e inventario de FINAN-X.
          </p>
        </div>
        <Button size="lg" onClick={onNew}>
          <Plus className="size-4" />
          Registrar Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          Filtros
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
            placeholder="Código"
            className={inputCls}
            aria-label="Filtrar por código"
          />
          <input
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Nombre"
            className={inputCls}
            aria-label="Filtrar por nombre"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | "all")}
            className={inputCls}
            aria-label="Filtrar por categoría"
          >
            <option value="all">Todas las categorías</option>
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as "all" | "ok" | "low" | "out")}
            className={inputCls}
            aria-label="Filtrar por nivel de stock"
          >
            <option value="all">Todo el stock</option>
            <option value="ok">Suficiente</option>
            <option value="low">Stock bajo</option>
            <option value="out">Agotado</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProductStatus | "all")}
            className={inputCls}
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground">
            Mostrando <strong className="text-foreground">{filtered.length}</strong> de{" "}
            <strong className="text-foreground">{products.length}</strong> productos
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onView={onView}
                onEdit={onEdit}
                onInactivate={onInactivate}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            {hasFilters ? <SearchX className="size-6" /> : <Package className="size-6" />}
          </div>
          <p className="text-sm font-medium text-foreground">
            {hasFilters ? "No se encontraron productos" : "Aún no hay productos registrados"}
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {hasFilters
              ? "Prueba ajustando o limpiando los filtros de búsqueda."
              : "Registra tu primer producto para comenzar a gestionar el catálogo."}
          </p>
          {hasFilters ? (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Limpiar filtros
            </Button>
          ) : (
            <Button size="sm" onClick={onNew}>
              <Plus className="size-4" />
              Registrar Producto
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
