"use client"

import { useMemo, useState } from "react"

/**
 * Lightweight net-movement bar chart for the last 30 days.
 * Positive bars (entradas) grow up in accent blue; negative (salidas) grow down in red.
 */
export function StockChart({ data }: { data: number[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const max = useMemo(() => Math.max(1, ...data.map((d) => Math.abs(d))), [data])
  const entradas = data.filter((d) => d > 0).reduce((a, b) => a + b, 0)
  const salidas = data.filter((d) => d < 0).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2.5 rounded-sm bg-accent" aria-hidden />
          Entradas <strong className="text-foreground">+{entradas}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2.5 rounded-sm bg-destructive" aria-hidden />
          Salidas <strong className="text-foreground">{salidas}</strong>
        </span>
      </div>

      <div className="relative flex h-40 items-stretch gap-[3px]" role="img" aria-label="Movimiento de stock de los últimos 30 días">
        {/* Zero baseline */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />

        {data.map((value, i) => {
          const heightPct = (Math.abs(value) / max) * 50
          const positive = value >= 0
          const active = hover === i
          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* Top half (positive) */}
              <div className="flex flex-1 flex-col justify-end">
                {positive && (
                  <div
                    className="w-full rounded-t-sm bg-accent transition-opacity"
                    style={{ height: `${heightPct}%`, opacity: active ? 1 : 0.85 }}
                  />
                )}
              </div>
              {/* Bottom half (negative) */}
              <div className="flex flex-1 flex-col justify-start">
                {!positive && (
                  <div
                    className="w-full rounded-b-sm bg-destructive transition-opacity"
                    style={{ height: `${heightPct}%`, opacity: active ? 1 : 0.85 }}
                  />
                )}
              </div>

              {active && (
                <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-lg">
                  Día {i + 1}: {value > 0 ? `+${value}` : value}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>Hace 30 días</span>
        <span>Hoy</span>
      </div>
    </div>
  )
}
