"use client"

import { useState } from "react"
import { Loader2, ShieldAlert, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/finanx/modal"
import { type Product, stockLevel } from "@/lib/finanx-data"

export function InactivateProductDialog({
  product,
  onClose,
  onConfirm,
}: {
  product: Product | null
  onClose: () => void
  onConfirm: (product: Product) => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const hasStock = !!product && product.stock > 0 && stockLevel(product) !== "out"

  const handleConfirm = () => {
    if (!product) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onConfirm(product)
    }, 800)
  }

  return (
    <Modal
      open={!!product}
      onClose={onClose}
      size="sm"
      title="Inactivar producto"
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="destructive" size="lg" onClick={handleConfirm} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Sí, inactivar
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-5" />
        </div>
        <div className="space-y-3">
          <p className="text-sm text-card-foreground">
            Vas a inactivar <strong className="font-semibold">{product?.name}</strong>. Este
            producto no estará disponible para nuevos pedidos. Esta acción quedará registrada en
            auditoría.
          </p>

          {hasStock && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
              <p className="text-xs text-warning-foreground">
                Aún hay <strong>{product!.stock} unidades</strong> en inventario. El stock
                permanecerá registrado pero no podrá venderse mientras el producto esté inactivo.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
