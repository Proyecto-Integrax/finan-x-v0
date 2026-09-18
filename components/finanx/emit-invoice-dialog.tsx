"use client"

import { useEffect, useState } from "react"
import { Send, Mail, BellRing, Hash } from "lucide-react"
import { Modal } from "@/components/finanx/modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type Factura,
  nextFacturaNumber,
  facturas as seedFacturas,
  formatDate,
} from "@/lib/finanx-data"

export interface EmitOptions {
  sendEmail: boolean
  notifyDue: boolean
}

export function EmitInvoiceDialog({
  factura,
  existing,
  onClose,
  onConfirm,
}: {
  factura: Factura | null
  existing: Factura[]
  onClose: () => void
  onConfirm: (factura: Factura, options: EmitOptions) => void
}) {
  const [sendEmail, setSendEmail] = useState(true)
  const [notifyDue, setNotifyDue] = useState(true)

  useEffect(() => {
    if (factura) {
      setSendEmail(true)
      setNotifyDue(true)
    }
  }, [factura])

  if (!factura) return null

  const assignedNumber = factura.number ?? nextFacturaNumber(existing ?? seedFacturas)

  return (
    <Modal
      open={!!factura}
      onClose={onClose}
      size="sm"
      title="Emitir factura"
      description="Al emitir, se asignará un número correlativo y se enviará al cliente."
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="lg" onClick={() => onConfirm(factura, { sendEmail, notifyDue })}>
            <Send className="size-4" />
            Emitir factura
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Hash className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Número correlativo a asignar</p>
            <p className="font-mono text-sm font-semibold text-foreground">{assignedNumber}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground">Vence</p>
            <p className="text-sm font-medium text-foreground">{formatDate(factura.dueDate)}</p>
          </div>
        </div>

        <fieldset className="space-y-2.5">
          <legend className="mb-1 text-sm font-medium text-foreground">
            Acciones al emitir
          </legend>

          <OptionRow
            checked={sendEmail}
            onChange={setSendEmail}
            icon={<Mail className="size-4" />}
            title="Enviar por email"
            description={`Se enviará a ${factura.clientEmail}`}
          />
          <OptionRow
            checked={notifyDue}
            onChange={setNotifyDue}
            icon={<BellRing className="size-4" />}
            title="Notificar vencimiento"
            description="Recordatorio automático antes de la fecha límite"
          />
        </fieldset>
      </div>
    </Modal>
  )
}

function OptionRow({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
        checked ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-primary"
      />
      <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </label>
  )
}
