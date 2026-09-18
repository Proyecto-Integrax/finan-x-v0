"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/finanx/topbar"
import { OrdersHistory } from "@/components/finanx/orders-history"
import { OrderBuilder } from "@/components/finanx/order-builder"
import { OrderDetail } from "@/components/finanx/order-detail"
import { CancelOrderDialog } from "@/components/finanx/cancel-order-dialog"
import { useToast } from "@/components/finanx/toast"
import {
  type Pedido,
  pedidos as seedPedidos,
  nextPedidoId,
} from "@/lib/finanx-data"

type View =
  | { name: "list" }
  | { name: "detail"; pedido: Pedido }
  | { name: "create" }
  | { name: "edit"; pedido: Pedido }

export function OrdersModule() {
  const { notify } = useToast()

  const [data, setData] = useState<Pedido[]>(seedPedidos)
  const [view, setView] = useState<View>({ name: "list" })
  const [globalSearch, setGlobalSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState<Pedido | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const handleSave = ({
    client,
    lines,
    editing,
  }: {
    client: { id: string; razonSocial: string; nit: string }
    lines: Pedido["lines"]
    editing: Pedido | null
  }) => {
    const now = new Date().toISOString().slice(0, 10)

    if (editing) {
      const updated: Pedido = {
        ...editing,
        clientId: client.id,
        clientName: client.razonSocial,
        clientNit: client.nit,
        lines,
      }
      setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setView({ name: "detail", pedido: updated })
      notify({
        variant: "success",
        title: "Pedido actualizado",
        description: `${updated.id} se guardó correctamente.`,
      })
    } else {
      const id = nextPedidoId(data)
      const created: Pedido = {
        id,
        clientId: client.id,
        clientName: client.razonSocial,
        clientNit: client.nit,
        createdAt: now,
        status: "BORRADOR",
        lines,
      }
      setData((prev) => [created, ...prev])
      setView({ name: "detail", pedido: created })
      notify({
        variant: "success",
        title: `Pedido ${id} creado en estado BORRADOR`,
        description: "El pedido se guardó como borrador correctamente.",
      })
    }
  }

  const handleCancel = (pedido: Pedido, reason: string) => {
    const now = new Date().toISOString().slice(0, 10)
    const updated: Pedido = {
      ...pedido,
      status: "CANCELADO",
      cancelReason: reason,
      cancelledAt: now,
    }
    setData((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setView((v) =>
      v.name === "detail" && v.pedido.id === updated.id ? { name: "detail", pedido: updated } : v,
    )
    setCancelTarget(null)
    notify({
      variant: "warning",
      title: `Pedido ${pedido.id} cancelado`,
      description: "Se liberó el stock reservado del pedido.",
    })
  }

  const breadcrumb =
    view.name === "detail"
      ? view.pedido.id
      : view.name === "create"
        ? "Nuevo pedido"
        : view.name === "edit"
          ? `Modificar ${view.pedido.id}`
          : "Historial"

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar
        root="Pedidos"
        breadcrumb={breadcrumb}
        globalSearch={globalSearch}
        onGlobalSearch={setGlobalSearch}
        searchPlaceholder="Buscar pedido por número o cliente..."
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {view.name === "list" && (
          <OrdersHistory
            pedidos={data}
            globalSearch={globalSearch}
            loading={loading}
            onNew={() => setView({ name: "create" })}
            onView={(p) => setView({ name: "detail", pedido: p })}
            onEdit={(p) => setView({ name: "edit", pedido: p })}
            onCancel={setCancelTarget}
          />
        )}

        {view.name === "detail" && (
          <OrderDetail
            pedido={view.pedido}
            onBack={() => setView({ name: "list" })}
            onEdit={(p) => setView({ name: "edit", pedido: p })}
            onCancel={setCancelTarget}
          />
        )}

        {(view.name === "create" || view.name === "edit") && (
          <OrderBuilder
            editing={view.name === "edit" ? view.pedido : null}
            onBack={() => setView({ name: "list" })}
            onSave={handleSave}
          />
        )}
      </main>

      <CancelOrderDialog
        pedido={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </div>
  )
}
