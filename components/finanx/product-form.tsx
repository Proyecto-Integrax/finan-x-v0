"use client"

import { useMemo, useState } from "react"
import { Check, X, Loader2, CircleAlert, History, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/finanx/modal"
import { cn } from "@/lib/utils"
import {
  type Product,
  type ProductCategory,
  products,
  productCategories,
  formatDate,
} from "@/lib/finanx-data"

export interface ProductFormValues {
  code: string
  name: string
  price: string
  cost: string
  iva: string
  stockMin: string
  category: ProductCategory | ""
}

const empty: ProductFormValues = {
  code: "",
  name: "",
  price: "",
  cost: "",
  iva: "19",
  stockMin: "0",
  category: "",
}

const takenCodes = products.map((p) => p.code.toLowerCase())

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  status,
  hint,
  required,
  prefix,
  suffix,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  status?: "valid" | "invalid" | null
  hint?: { text: string; tone: "ok" | "error" } | null
  required?: boolean
  prefix?: string
  suffix?: string
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
              : "top-1/2 -translate-y-1/2 text-sm",
            floated && prefix ? "left-3" : prefix && "left-7",
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </label>

        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={status === "invalid"}
          className={cn(
            "h-11 w-full rounded-lg border bg-card text-sm outline-none transition-colors focus:ring-2",
            prefix ? "pl-7" : "pl-3",
            suffix || status ? "pr-9" : "pr-3",
            status === "invalid"
              ? "border-destructive focus:border-destructive focus:ring-destructive/25"
              : status === "valid"
                ? "border-success focus:border-success focus:ring-success/25"
                : "border-input focus:border-ring focus:ring-ring/30",
          )}
        />

        {status ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === "valid" ? (
              <Check className="size-4 text-success" />
            ) : (
              <X className="size-4 text-destructive" />
            )}
          </span>
        ) : (
          suffix && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {suffix}
            </span>
          )
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

export function ProductForm({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean
  onClose: () => void
  editing: Product | null
  onSave: (values: ProductFormValues, editing: Product | null) => void
}) {
  const [values, setValues] = useState<ProductFormValues>(empty)
  const [submitting, setSubmitting] = useState(false)
  const [initialized, setInitialized] = useState<string | null>(null)

  const key = editing?.id ?? "new"
  if (open && initialized !== key) {
    setValues(
      editing
        ? {
            code: editing.code,
            name: editing.name,
            price: String(editing.price),
            cost: String(editing.cost),
            iva: String(editing.iva),
            stockMin: String(editing.stockMin),
            category: editing.category,
          }
        : empty,
    )
    setInitialized(key)
  }
  if (!open && initialized !== null) setInitialized(null)

  const set = (field: keyof ProductFormValues) => (v: string) =>
    setValues((prev) => ({ ...prev, [field]: v }))

  const codeStatus = useMemo<"valid" | "invalid" | null>(() => {
    if (!values.code.trim()) return null
    const isEditingSelf = editing && editing.code.toLowerCase() === values.code.toLowerCase()
    const taken = takenCodes.includes(values.code.toLowerCase()) && !isEditingSelf
    return taken ? "invalid" : "valid"
  }, [values.code, editing])

  const stockMinNum = Number(values.stockMin)
  const stockAlertOn = !Number.isNaN(stockMinNum) && stockMinNum > 0

  const priceNum = Number(values.price)
  const priceValid = !Number.isNaN(priceNum) && priceNum > 0

  const canSubmit =
    values.code.trim() &&
    values.name.trim() &&
    codeStatus === "valid" &&
    priceValid &&
    values.category !== "" &&
    !submitting

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onSave(values, editing)
    }, 900)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Actualizar Producto" : "Registrar Producto"}
      description={
        editing
          ? "Modifica la información del producto. Los cambios quedan registrados en auditoría."
          : "Completa los datos para agregar un nuevo producto al catálogo."
      }
      footer={
        <>
          <Button variant="outline" size="lg" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button size="lg" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Guardar cambios" : "Guardar Producto"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {editing && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <History className="size-3.5 shrink-0" />
            <span>
              Última modificación:{" "}
              <strong className="text-foreground">{formatDate(editing.lastModifiedAt)}</strong> por{" "}
              <strong className="text-foreground">{editing.lastModifiedBy}</strong>
            </span>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="code"
            label="Código"
            required
            value={values.code}
            onChange={set("code")}
            status={codeStatus}
            hint={
              codeStatus === "invalid"
                ? { text: "El código ya existe en el catálogo", tone: "error" }
                : codeStatus === "valid"
                  ? { text: "Código disponible", tone: "ok" }
                  : null
            }
          />
          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-xs font-medium text-foreground"
            >
              Categoría <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              value={values.category}
              onChange={(e) => set("category")(e.target.value)}
              className={cn(
                "h-11 w-full rounded-lg border bg-card px-3 text-sm outline-none transition-colors focus:ring-2",
                values.category
                  ? "border-input focus:border-ring focus:ring-ring/30"
                  : "border-input text-muted-foreground focus:border-ring focus:ring-ring/30",
              )}
            >
              <option value="">Selecciona una categoría</option>
              {productCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Field id="name" label="Nombre" required value={values.name} onChange={set("name")} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="price"
            label="Precio"
            type="number"
            required
            prefix="$"
            value={values.price}
            onChange={set("price")}
            status={values.price ? (priceValid ? "valid" : "invalid") : null}
            hint={
              values.price && !priceValid
                ? { text: "El precio debe ser mayor a 0", tone: "error" }
                : null
            }
          />
          <Field
            id="cost"
            label="Costo"
            type="number"
            prefix="$"
            value={values.cost}
            onChange={set("cost")}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="iva"
            label="IVA"
            type="number"
            suffix="%"
            value={values.iva}
            onChange={set("iva")}
          />
          <Field
            id="stockMin"
            label="Stock mínimo"
            type="number"
            value={values.stockMin}
            onChange={set("stockMin")}
          />
        </div>

        {/* Automatic low-stock alert badge */}
        {stockAlertOn && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm animate-in fade-in">
            <TriangleAlert className="size-4 shrink-0 text-warning-foreground" />
            <span className="font-medium text-warning-foreground">
              Alerta de stock bajo activada
            </span>
            <span className="text-xs text-warning-foreground/80">
              Se notificará cuando el inventario llegue a {stockMinNum} unidades o menos.
            </span>
          </div>
        )}

        {/* CU8 · Historial de cambios */}
        {editing && editing.history.length > 0 && (
          <div className="rounded-lg border border-border">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-semibold text-foreground">
              <History className="size-3.5 text-muted-foreground" />
              Historial de cambios
            </div>
            <ul className="divide-y divide-border">
              {editing.history.map((h, i) => (
                <li key={i} className="flex gap-3 px-3 py-2.5">
                  <div className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground">{h.description}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatDate(h.date)} · {h.user}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
