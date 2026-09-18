"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/finanx/topbar"
import { ProductsGrid } from "@/components/finanx/products-grid"
import { ProductDetail } from "@/components/finanx/product-detail"
import { ProductForm, type ProductFormValues } from "@/components/finanx/product-form"
import { InactivateProductDialog } from "@/components/finanx/inactivate-product-dialog"
import { useToast } from "@/components/finanx/toast"
import {
  type Product,
  products as seedProducts,
  productCategories,
} from "@/lib/finanx-data"

type View = { name: "list" } | { name: "detail"; product: Product }

export function ProductsModule() {
  const { notify } = useToast()

  const [data, setData] = useState<Product[]>(seedProducts)
  const [view, setView] = useState<View>({ name: "list" })
  const [globalSearch, setGlobalSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [inactivateTarget, setInactivateTarget] = useState<Product | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (p: Product) => {
    setEditing(p)
    setFormOpen(true)
  }

  const handleSave = (values: ProductFormValues, editingProduct: Product | null) => {
    const now = new Date().toISOString().slice(0, 10)
    const category =
      (productCategories.find((c) => c === values.category) ?? "Oficina") as Product["category"]

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        code: values.code,
        name: values.name,
        price: Number(values.price) || 0,
        cost: Number(values.cost) || 0,
        iva: Number(values.iva) || 0,
        stockMin: Number(values.stockMin) || 0,
        category,
        lastModifiedAt: now,
        lastModifiedBy: "María Fernanda Gómez",
        history: [
          { date: now, user: "María Fernanda Gómez", description: "Producto actualizado" },
          ...editingProduct.history,
        ],
      }
      setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setView((v) => (v.name === "detail" ? { name: "detail", product: updated } : v))
      notify({
        variant: "success",
        title: "Producto actualizado",
        description: `${updated.name} se guardó correctamente.`,
      })
    } else {
      const created: Product = {
        id: `p${Date.now()}`,
        code: values.code,
        name: values.name,
        price: Number(values.price) || 0,
        cost: Number(values.cost) || 0,
        iva: Number(values.iva) || 0,
        stockMin: Number(values.stockMin) || 0,
        stock: 0,
        category,
        estado: "active",
        createdAt: now,
        lastModifiedAt: now,
        lastModifiedBy: "María Fernanda Gómez",
        history: [{ date: now, user: "María Fernanda Gómez", description: "Producto creado" }],
        movement: Array.from({ length: 30 }, () => 0),
      }
      setData((prev) => [created, ...prev])
      notify({
        variant: "success",
        title: "Producto registrado exitosamente",
        description: `${created.name} fue agregado al catálogo.`,
      })
    }
    setFormOpen(false)
    setEditing(null)
  }

  const handleInactivate = (p: Product) => {
    const updated: Product = { ...p, estado: "inactive" }
    setData((prev) => prev.map((x) => (x.id === p.id ? updated : x)))
    setView((v) => (v.name === "detail" ? { name: "detail", product: updated } : v))
    setInactivateTarget(null)
    notify({
      variant: "warning",
      title: "Producto inactivado",
      description: `${p.name} ya no está disponible para nuevos pedidos.`,
    })
  }

  const breadcrumb = view.name === "detail" ? view.product.name : "Catálogo"

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar
        root="Productos"
        breadcrumb={breadcrumb}
        globalSearch={globalSearch}
        onGlobalSearch={setGlobalSearch}
        searchPlaceholder="Buscar producto por código o nombre..."
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {view.name === "list" ? (
          <ProductsGrid
            products={data}
            globalSearch={globalSearch}
            loading={loading}
            onNew={openNew}
            onView={(p) => setView({ name: "detail", product: p })}
            onEdit={openEdit}
            onInactivate={setInactivateTarget}
          />
        ) : (
          <ProductDetail
            product={view.product}
            onBack={() => setView({ name: "list" })}
            onEdit={openEdit}
            onInactivate={setInactivateTarget}
          />
        )}
      </main>

      <ProductForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        editing={editing}
        onSave={handleSave}
      />

      <InactivateProductDialog
        product={inactivateTarget}
        onClose={() => setInactivateTarget(null)}
        onConfirm={handleInactivate}
      />
    </div>
  )
}
