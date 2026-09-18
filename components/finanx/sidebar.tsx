"use client"

import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  Landmark,
} from "lucide-react"
import { cn } from "@/lib/utils"

const modules = [
  { id: "m1", label: "Clientes", icon: Users, enabled: true },
  { id: "m2", label: "Productos", icon: Package, enabled: true },
  { id: "m3", label: "Pedidos", icon: ShoppingCart, enabled: true },
  { id: "m4", label: "Facturación", icon: FileText, enabled: false },
  { id: "m5", label: "Pagos", icon: CreditCard, enabled: false },
  { id: "m6", label: "Reportes", icon: BarChart3, enabled: false },
  { id: "m7", label: "Administración", icon: Settings, enabled: false },
]

export function Sidebar({
  collapsed,
  onToggle,
  active,
  onNavigate,
}: {
  collapsed: boolean
  onToggle: () => void
  active: string
  onNavigate: (id: string) => void
}) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Landmark className="size-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">FINAN-X</p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">
              Gestión Financiera
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
            Módulos
          </p>
        )}
        {modules.map((m) => (
          <button
            key={m.id}
            onClick={() => m.enabled && onNavigate(m.id)}
            disabled={!m.enabled}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              active === m.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !m.enabled && "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-sidebar-foreground/75",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? m.label : m.enabled ? undefined : "Próximamente"}
          >
            <m.icon className="size-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{m.label}</span>}
            {!collapsed && !m.enabled && (
              <span className="ml-auto rounded bg-sidebar-accent px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-sidebar-foreground/50">
                Pronto
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <ChevronLeft
            className={cn("size-[18px] shrink-0 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  )
}
