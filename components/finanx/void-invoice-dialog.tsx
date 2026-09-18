"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, FileMinus, Ban } from "lucide-react"
import { Modal } from "@/components/finanx/modal"
import { Button } from "@/components/ui/button"
import {
  type Factura,
  effectiveFacturaStatus,
  formatCurrency,
  orderTotals,
} from "@/lib/finanx-data"

export function VoidInvoiceDialog({
  factura,
  onClose,
  onVoid,
  onCreditNote,
}: {
  factura: Factura | null
  onClose: () => void
  onVoid: (factura: Factura, reason: string) => void
  onCreditNote: (factura: Factura) => void
}) {
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (factura) {
      setReason("")
      setTouched(false)
    }
  }, [factura])

  if (!factura) return null

  const isPaid = effectiveFacturaStatus(factura) === "PAGADA"
  const invalid = reason.trim().length === 0
  const total = orderTotals(factura.lines).total

  const handleVoid = () => {
    setTouched(true)
    if (invalid) return
    onVoid(factura, reason.trim())
  }

  return (
    <Modal
      open={!!factura}
      onClose={onClose}
      size="sm"
      title={isPaid ? "Factura pagada" : `¿Anular factura ${factura.number ?? ""}?`}
      description={
        isPaid
          ? "No es posible anular una factura ya pagada."
          : "La anulación deja constancia en el histórico contable."
      }
      footer={
        isPaid ? (
          <>
            <Button variant="outline" size="lg" onClick={onClose}>
              Volver
            </Button>
            <Button size="lg" onClick={() => onCreditNote(factura)}>
              <FileMinus className="size-4" />
              Generar Nota de Crédito
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="lg" onClick={onClose}>
              Volver
            </Button>
            <Button variant="destructive" size="lg" onClick={handleVoid}>
              <Ban className="size-4" />
              Anular factura
            </Button>
          </>
        )
      }
    >
      {isPaid ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3.5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-foreground" aria-hidden />
            <p className="text-sm text-foreground">
              Esta factura por <strong>{formatCurrency(total)}</strong> ya fue pagada por el
              cliente. Para reversar la operación debes emitir una{" "}
              <strong>Nota de Crédito</strong> que compense el valor facturado.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Esta acción es irreversible
              </p>
              <p className="mt-0.5 text-sm text-foreground">
                El número correlativo quedará marcado como anulado y no podrá reutilizarse.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="void-reason"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Motivo de anulación <span className="text-destructive">*</span>
            </label>
            <textarea
              id="void-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={3}
              placeholder="Describe por qué se anula la factura..."
              aria-invalid={touched && invalid}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/20"
            />
            {touched && invalid && (
              <p className="mt-1.5 text-xs text-destructive">
                El motivo de anulación es obligatorio.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
