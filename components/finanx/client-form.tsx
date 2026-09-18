"use client"

import { useMemo, useState } from "react"
import { Check, X, Loader2, CircleAlert, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/finanx/modal"
import { cn } from "@/lib/utils"
import { type Client, clients, formatDate } from "@/lib/finanx-data"

interface FormValues {
  nit: string
  razonSocial: string
  correo: string
  telefono: string
  direccion: string
}

const empty: FormValues = { nit: "", razonSocial: "", correo: "", telefono: "", direccion: "" }

// Simulated "taken" NITs to demo the live uniqueness check.
const takenNits = clients.map((c) => c.nit)

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  textarea,
  status,
  hint,
  required,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  textarea?: boolean
  status?: "checking" | "valid" | "invalid" | null
  hint?: { text: string; tone: "ok" | "error" } | null
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0

  return (
    <div>
      <div className="relative">
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 bg-card px-1 text-muted-foreground transition-all duration-150",
            floated
              ? "-top-2 text-xs font-medium text-foreground"
              : textarea
                ? "top-3 text-sm"
                : "top-1/2 -translate-y-1/2 text-sm",
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>

        {textarea ? (
          <textarea
            id={id}
            value={value}
            rows={3}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={status === "invalid"}
            className={cn(
              "h-11 w-full rounded-lg border bg-card px-3 pr-9 text-sm outline-none transition-colors focus:ring-2",
              status === "invalid"
                ? "border-destructive focus:border-destructive focus:ring-destructive/25"
                : status === "valid"
                  ? "border-success focus:border-success focus:ring-success/25"
                  : "border-input focus:border-ring focus:ring-ring/30",
            )}
          />
        )}

        {status && !textarea && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === "checking" && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
            {status === "valid" && <Check className="size-4 text-success" />}
            {status === "invalid" && <X className="size-4 text-destructive" />}
          </span>
        )}
      </div>

      {hint && (
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs",
            hint.tone === "ok" ? "text-success" : "text-destructive",
          )}
        >
          {hint.tone === "error" && <CircleAlert className="size-3.5" />}
          {hint.text}
        </p>
      )}
    </div>
  )
}

export function ClientForm({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean
  onClose: () => void
  editing: Client | null
  onSave: (values: FormValues, editing: Client | null) => void
}) {
  const [values, setValues] = useState<FormValues>(empty)
  const [submitting, setSubmitting] = useState(false)
  const [initialized, setInitialized] = useState<string | null>(null)

  // Sync form state when opening for create vs edit.
  const key = editing?.id ?? "new"
  if (open && initialized !== key) {
    setValues(editing ? { ...editing } : empty)
    setInitialized(key)
  }
  if (!open && initialized !== null) {
    setInitialized(null)
  }

  const set = (field: keyof FormValues) => (v: string) =>
    setValues((prev) => ({ ...prev, [field]: v }))

  const nitStatus = useMemo<"valid" | "invalid" | null>(() => {
    if (!values.nit.trim()) return null
    const isEditingSelf = editing && editing.nit === values.nit
    const taken = takenNits.includes(values.nit) && !isEditingSelf
    return taken ? "invalid" : "valid"
  }, [values.nit, editing])

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo)
  const emailStatus: "valid" | "invalid" | null = !values.correo
    ? null
    : emailValid
      ? "valid"
      : "invalid"

  const canSubmit =
    values.nit.trim() &&
    values.razonSocial.trim() &&
    nitStatus === "valid" &&
    emailStatus === "valid" &&
    !submitting

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitting(true)
    // Simulate async persistence.
    setTimeout(() => {
      setSubmitting(false)
      onSave(values, editing)
    }, 900)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Actualizar Cliente" : "Registrar Cliente"}
      description={
        editing
          ? "Modifica la información del cliente. Los cambios quedan registrados en auditoría."
          : "Completa los datos para dar de alta un nuevo cliente."
      }
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button size="lg" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Guardar cambios" : "Guardar Cliente"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {editing && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <History className="size-3.5 shrink-0" />
            <span>
              Última modificación: <strong className="text-foreground">{formatDate(editing.lastModifiedAt)}</strong>{" "}
              por <strong className="text-foreground">{editing.lastModifiedBy}</strong>
            </span>
          </div>
        )}

        <Field
          id="nit"
          label="NIT"
          required
          value={values.nit}
          onChange={set("nit")}
          status={nitStatus}
          hint={
            nitStatus === "invalid"
              ? { text: "El NIT ya existe en el sistema", tone: "error" }
              : nitStatus === "valid"
                ? { text: "NIT disponible", tone: "ok" }
                : null
          }
        />

        <Field
          id="razonSocial"
          label="Razón Social"
          required
          value={values.razonSocial}
          onChange={set("razonSocial")}
        />

        <Field
          id="correo"
          label="Correo electrónico"
          type="email"
          required
          value={values.correo}
          onChange={set("correo")}
          status={emailStatus}
          hint={
            emailStatus === "invalid"
              ? { text: "Ingresa un correo con formato válido", tone: "error" }
              : null
          }
        />

        <Field
          id="telefono"
          label="Teléfono"
          type="tel"
          value={values.telefono}
          onChange={set("telefono")}
        />

        <Field
          id="direccion"
          label="Dirección"
          textarea
          value={values.direccion}
          onChange={set("direccion")}
        />
      </div>
    </Modal>
  )
}
