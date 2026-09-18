"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Building2,
  Check,
  ChevronDown,
  Info,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/finanx/product-card"
import { cn } from "@/lib/utils"
import {
  type Product,
  type ProductCategory,
  type Client,
  type Pedido,
  type OrderLine,
  productCategories,
  products as allProducts,
  clients as allClients,
  formatCurrency,
  orderTotals,
  stockLevel,
} from "@/lib/finanx-data"

type CartMap = Record<string, number>

function linesFromCart(cart: CartMap): OrderLine[] {
  return Object.entries(cart).map(([productId, quantity]) => {
    const p = allProducts.find((x) => x.id === productId)!
    return {
      productId: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      price: p.price,
      iva: p.iva,
      quantity,
    }
  })
}

function ClientSelector({
  client,
  onSelect,
}: {
  client: Client | null
  onSelect: (c: Client) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allClients
      .filter((c) => c.estado === "active")
      .filter(
        (c) =>
          !q || c.razonSocial.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q),
      )
  }, [query])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg border border-input bg-background px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-muted/40 focus:border-ring focus:ring-2 focus:ring-ring/30"
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="size-4" />
        </div>
        {client ? (
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{client.razonSocial}</p>
            <p className="text-xs text-muted-foreground">NIT {client.nit}</p>
          </div>
        ) : (
          <span className="flex-1 text-muted-foreground">Selecciona un cliente…</span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
            <div className="relative border-b border-border p-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por razón social o NIT…"
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <ul className="max-h-64 overflow-y-auto p-1">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Sin coincidencias
                </li>
              ) : (
                results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(c)
                        setOpen(false)
                        setQuery("")
                      }}
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{c.razonSocial}</p>
                        <p className="text-xs text-muted-foreground">NIT {c.nit}</p>
                      </div>
                      {client?.id === c.id && <Check className="size-4 text-primary" />}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

function CatalogCard({
  product,
  inCart,
  onAdd,
}: {
  product: Product
  inCart: number
  onAdd: (p: Product) => void
}) {
  const isService = product.category === "Servicios"
  const level = stockLevel(product)
  const outOfStock = !isService && product.stock <= 0
  const remaining = product.stock - inCart
  const capReached = !isService && remaining <= 0

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative">
        <ProductImage category={product.category} className="h-24 w-full" iconClassName="size-9" />
        <div className="absolute left-2.5 top-2.5">
          <span className="rounded-md bg-card/85 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground backdrop-blur">
            {product.code}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] text-muted-foreground">{product.category}</p>
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-base font-bold text-foreground">{formatCurrency(product.price)}</p>
          {!isService &&
            (outOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive ring-1 ring-inset ring-destructive/20">
                <X className="size-3" />
                Sin stock
              </span>
            ) : (
              <span
                className={cn(
                  "text-[11px] font-medium",
                  level === "low" ? "text-warning-foreground" : "text-muted-foreground",
                )}
              >
                {remaining} disp.
              </span>
            ))}
        </div>

        <Button
          size="sm"
          variant={capReached || outOfStock ? "outline" : "default"}
          disabled={outOfStock || capReached}
          onClick={() => onAdd(product)}
          className="mt-3 w-full"
        >
          {outOfStock ? (
            "Sin stock"
          ) : capReached ? (
            "Máximo alcanzado"
          ) : (
            <>
              <Plus className="size-3.5" />
              Agregar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function OrderBuilder({
  editing,
  onBack,
  onSave,
}: {
  editing: Pedido | null
  onBack: () => void
  onSave: (data: { client: Client; lines: OrderLine[]; editing: Pedido | null }) => void
}) {
  const [client, setClient] = useState<Client | null>(
    editing ? allClients.find((c) => c.id === editing.clientId) ?? null : null,
  )
  const [cart, setCart] = useState<CartMap>(() => {
    if (!editing) return {}
    return editing.lines.reduce<CartMap>((acc, l) => {
      acc[l.productId] = l.quantity
      return acc
    }, {})
  })
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<ProductCategory | "all">("all")

  const catalog = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allProducts
      .filter((p) => p.estado === "active")
      .filter((p) => category === "all" || p.category === category)
      .filter(
        (p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
      )
  }, [search, category])

  const lines = linesFromCart(cart)
  const totals = orderTotals(lines)
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0)

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const current = prev[p.id] ?? 0
      const isService = p.category === "Servicios"
      if (!isService && current + 1 > p.stock) return prev
      return { ...prev, [p.id]: current + 1 }
    })
  }

  const setQuantity = (productId: string, qty: number) => {
    const p = allProducts.find((x) => x.id === productId)!
    const isService = p.category === "Servicios"
    const max = isService ? 9999 : p.stock
    const clamped = Math.max(1, Math.min(qty, max))
    setCart((prev) => ({ ...prev, [productId]: clamped }))
  }

  const removeLine = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const canSave = !!client && lines.length > 0

  const inputCls =
    "h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {editing ? `Modificar pedido ${editing.id}` : "Registrar Pedido"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {editing
              ? "Ajusta el cliente, los productos y las cantidades del pedido."
              : "Selecciona un cliente y agrega productos al carrito para crear un borrador."}
          </p>
        </div>
      </div>

      {editing && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-foreground">
            Este pedido no ha sido facturado. Puedes modificarlo.
          </p>
        </div>
      )}

      {/* Client selector */}
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="mb-2 block text-sm font-medium text-foreground">Cliente</label>
        <ClientSelector client={client} onSelect={setClient} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Catalog (left, ~70%) */}
        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto por nombre o código…"
                  className={cn(inputCls, "w-full pl-9")}
                  aria-label="Buscar producto"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory | "all")}
                className={cn(inputCls, "sm:w-52")}
                aria-label="Filtrar por categoría"
              >
                <option value="all">Todas las categorías</option>
                {productCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {/* Category chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategory("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  category === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                Todas
              </button>
              {productCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    category === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {catalog.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.map((p) => (
                <CatalogCard key={p.id} product={p} inCart={cart[p.id] ?? 0} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Search className="size-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No se encontraron productos</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Ajusta la búsqueda o cambia la categoría seleccionada.
              </p>
            </div>
          )}
        </section>

        {/* Cart (right, ~30%) */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Carrito de pedido</h2>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
              </span>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                <div className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
                  <ShoppingCart className="size-5" />
                </div>
                <p className="text-sm font-medium text-foreground">Carrito vacío</p>
                <p className="max-w-[14rem] text-xs text-muted-foreground">
                  Agrega productos del catálogo para armar el pedido.
                </p>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-border overflow-y-auto">
                {lines.map((l) => (
                  <li key={l.productId} className="flex gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                        {l.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatCurrency(l.price)} c/u · IVA {l.iva}%
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-border">
                          <button
                            onClick={() => setQuantity(l.productId, l.quantity - 1)}
                            className="grid size-7 place-items-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={l.quantity}
                            onChange={(e) =>
                              setQuantity(l.productId, Number.parseInt(e.target.value, 10) || 1)
                            }
                            className="h-7 w-10 border-x border-border bg-background text-center text-sm outline-none [appearance:textfield] focus:ring-1 focus:ring-ring/40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label={`Cantidad de ${l.name}`}
                          />
                          <button
                            onClick={() => setQuantity(l.productId, l.quantity + 1)}
                            className="grid size-7 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeLine(l.productId)}
                          className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Quitar ${l.name}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(l.price * l.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {/* Totals + action */}
            <div className="border-t border-border p-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium text-foreground">{formatCurrency(totals.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">IVA</dt>
                  <dd className="font-medium text-foreground">{formatCurrency(totals.iva)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-1.5">
                  <dt className="text-sm font-semibold text-foreground">TOTAL</dt>
                  <dd className="text-lg font-bold text-primary">{formatCurrency(totals.total)}</dd>
                </div>
              </dl>

              {!client && lines.length > 0 && (
                <p className="mt-3 text-xs text-warning-foreground">
                  Selecciona un cliente para guardar el pedido.
                </p>
              )}

              <Button
                size="lg"
                disabled={!canSave}
                onClick={() => client && onSave({ client, lines, editing })}
                className="mt-3 w-full"
              >
                <Save className="size-4" />
                {editing ? "Guardar cambios" : "Guardar Pedido en Borrador"}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
