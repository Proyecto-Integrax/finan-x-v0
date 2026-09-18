"use client"

import { useState } from "react"
import { Loader2, ShieldAlert, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/finanx/modal"
import { type Client, formatCurrency } from "@/lib/finanx-data"

export function InactivateDialog({
  client,
  onClose,
  onConfirm,
}: {
  client: Client | null
  onClose: () => void
  onConfirm: (client: Client) => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const hasDebt = !!client && client.saldo > 0

  const handleConfirm = () => {
    if (!client) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onConfirm(client)
    }, 800)
  }

  return (
    <Modal
      open={!!client}
      onClose={onClose}
      size="sm"
      title="Inactivar cliente"
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
            ¿Estás seguro? El cliente{" "}
            <strong className="font-semibold">{client?.razonSocial}</strong> no podrá iniciar
            sesión. Esta acción quedará registrada en auditoría.
          </p>

          {hasDebt && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
              <p className="text-xs text-warning-foreground">
                Este cliente tiene facturas pendientes por{" "}
                <strong>{formatCurrency(client!.saldo)}</strong>. Al inactivarlo, el saldo
                permanecerá en cartera hasta su conciliación.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
