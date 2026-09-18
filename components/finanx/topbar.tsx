"use client"

import { Search, Bell, ChevronRight } from "lucide-react"

export function Topbar({
  globalSearch,
  onGlobalSearch,
  breadcrumb,
  root,
  searchPlaceholder = "Buscar...",
}: {
  globalSearch: string
  onGlobalSearch: (v: string) => void
  breadcrumb: string
  root: string
  searchPlaceholder?: string
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      <nav aria-label="Ruta de navegación" className="hidden items-center gap-1.5 text-sm md:flex">
        <span className="text-muted-foreground">{root}</span>
        <ChevronRight className="size-3.5 text-muted-foreground/50" />
        <span className="font-medium text-foreground">{breadcrumb}</span>
      </nav>

      <div className="relative ml-auto w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={globalSearch}
          onChange={(e) => onGlobalSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          aria-label="Búsqueda global"
        />
      </div>

      <button
        className="relative grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notificaciones"
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          MG
        </div>
        <div className="hidden leading-tight md:block">
          <p className="text-sm font-medium text-foreground">María Gómez</p>
          <p className="text-[11px] text-muted-foreground">Gestor Financiero</p>
        </div>
      </div>
    </header>
  )
}
