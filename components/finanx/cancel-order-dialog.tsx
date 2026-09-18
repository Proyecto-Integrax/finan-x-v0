"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Modal } from "@/components/finanx/modal"
import { Button } from "@/components/ui/button"
import { type Pedido } from "@/lib/finanx-data"

export function CancelOrderDialog({
  pedido,
  onClose,
  onConfirm,
}: {
  pedido: Pedido | null
  onClose: () => void
  onConfirm: (pedido: Pedido, reason: string) => void
}) {
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (pedido) {
      setReason("")
      setTouched(false)
    }
  }, [pedido])

  if (!pedido) return null

  const invalid = reason.trim().length === 0

  const handleConfirm = () => {
    setTouched(true)
    if (invalid) return
    onConfirm(pedido, reason.trim())
  }

  return (
    <Modal
      open={!!pedido}
      onClose={onClose}
      size="sm"
      title={`¿Cancelar pedido ${pedido.id}?`}
      description="Se liberará el stock reservado para este pedido."
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose}>
            Volver
          </Button>
          <Button variant="destructive" size="lg" onClick={handleConfirm}>
            Cancelar pedido
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
          <p className="text-sm text-foreground">
            Esta acción no se puede deshacer. El inventario reservado volverá a estar disponible
            para otros pedidos.
          </p>
        </div>

        <div>
          <label
            htmlFor="cancel-reason"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Motivo de cancelación <span className="text-destructive">*</span>
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={3}
            placeholder="Describe por qué se cancela el pedido..."
            aria-invalid={touched && invalid}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20"
          />
          {touched && invalid && (
            <p className="mt-1.5 text-xs text-destructive">
              El motivo de cancelación es obligatorio.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
