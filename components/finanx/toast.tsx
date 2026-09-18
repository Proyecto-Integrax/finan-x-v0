"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastVariant = "success" | "error" | "warning"

interface Toast {
  id: number
  variant: ToastVariant
  title: string
  description?: string
}

interface ToastContextValue {
  notify: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; ring: string; iconColor: string }
> = {
  success: { icon: CheckCircle2, ring: "border-l-success", iconColor: "text-success" },
  error: { icon: XCircle, ring: "border-l-destructive", iconColor: "text-destructive" },
  warning: { icon: AlertTriangle, ring: "border-l-warning", iconColor: "text-warning-foreground" },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { ...t, id }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const { icon: Icon, ring, iconColor } = variantConfig[t.variant]
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-lg border border-l-4 bg-card p-3.5 shadow-lg animate-in slide-in-from-right-4 fade-in",
                ring,
              )}
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", iconColor)} aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar notificación"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
