"use client"

import {
  ArrowLeft,
  Pencil,
  Ban,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Hash,
  Wallet,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge, OrderStatusBadge } from "@/components/finanx/status-badge"
import { type Client, formatCurrency, formatDate } from "@/lib/finanx-data"

function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Hash
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  )
}

export function ClientDetail({
  client,
  onBack,
  onEdit,
  onInactivate,
}: {
  client: Client
  onBack: () => void
  onEdit: (c: Client) => void
  onInactivate: (c: Client) => void
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {client.razonSocial.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">
              {client.razonSocial}
            </h1>
            <p className="text-sm text-muted-foreground">NIT {client.nit}</p>
          </div>
        </div>
        <StatusBadge estado={client.estado} />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" onClick={() => onEdit(client)}>
            <Pencil className="size-4" />
            Editar
          </Button>
          {client.estado === "active" && (
            <Button variant="destructive" size="lg" onClick={() => onInactivate(client)}>
              <Ban className="size-4" />
              Inactivar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Datos generales */}
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-card-foreground">Datos generales</h2>
          <div className="mt-1 grid divide-y divide-border sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0">
            <DataRow icon={Hash} label="NIT" value={client.nit} />
            <DataRow icon={Mail} label="Correo electrónico" value={client.correo} />
            <DataRow icon={Phone} label="Teléfono" value={client.telefono} />
            <DataRow icon={MapPin} label="Dirección" value={client.direccion} />
          </div>
        </section>

        {/* Saldo actual */}
        <section className="flex flex-col rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-card-foreground">Saldo actual</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-5" />
            </div>
            <div>
              <p
                className={
                  client.saldo > 0
                    ? "text-2xl font-bold text-destructive"
                    : "text-2xl font-bold text-success"
                }
              >
                {formatCurrency(client.saldo)}
              </p>
              <p className="text-xs text-muted-foreground">
                {client.saldo > 0 ? "Facturas pendientes" : "Sin saldo pendiente"}
              </p>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            <History className="size-3.5" />
            Modificado el {formatDate(client.lastModifiedAt)} por {client.lastModifiedBy}
          </div>
        </section>
      </div>

      {/* Historial de pedidos */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-card-foreground">Historial de pedidos</h2>
          <Button variant="link" size="sm" className="px-0">
            Ver historial completo
            <ExternalLink className="size-3.5" />
          </Button>
        </div>

        {client.orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
            <p className="text-sm font-medium text-foreground">Sin pedidos registrados</p>
            <p className="text-xs text-muted-foreground">
              Este cliente aún no tiene pedidos asociados.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">N.º de pedido</th>
                <th className="px-5 py-2.5 font-medium">Fecha</th>
                <th className="px-5 py-2.5 font-medium">Estado</th>
                <th className="px-5 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {client.orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{o.id}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(o.date)}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-foreground">
                    {formatCurrency(o.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
