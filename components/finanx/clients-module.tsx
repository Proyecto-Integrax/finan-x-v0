"use client"

import { useEffect, useState } from "react"
import { Topbar } from "@/components/finanx/topbar"
import { ClientsTable } from "@/components/finanx/clients-table"
import { ClientDetail } from "@/components/finanx/client-detail"
import { ClientForm } from "@/components/finanx/client-form"
import { InactivateDialog } from "@/components/finanx/inactivate-dialog"
import { useToast } from "@/components/finanx/toast"
import { type Client, clients as seedClients } from "@/lib/finanx-data"

type View = { name: "list" } | { name: "detail"; client: Client }

export function ClientsModule() {
  const { notify } = useToast()

  const [data, setData] = useState<Client[]>(seedClients)
  const [view, setView] = useState<View>({ name: "list" })
  const [globalSearch, setGlobalSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [inactivateTarget, setInactivateTarget] = useState<Client | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (c: Client) => {
    setEditing(c)
    setFormOpen(true)
  }

  const handleSave = (
    values: {
      nit: string
      razonSocial: string
      correo: string
      telefono: string
      direccion: string
    },
    editingClient: Client | null,
  ) => {
    const now = new Date().toISOString().slice(0, 10)

    if (editingClient) {
      const updated: Client = {
        ...editingClient,
        ...values,
        lastModifiedAt: now,
        lastModifiedBy: "María Fernanda Gómez",
      }
      setData((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      setView((v) => (v.name === "detail" ? { name: "detail", client: updated } : v))
      notify({
        variant: "success",
        title: "Cliente actualizado",
        description: `${updated.razonSocial} se guardó correctamente.`,
      })
    } else {
      const created: Client = {
        id: `c${Date.now()}`,
        ...values,
        estado: "active",
        saldo: 0,
        createdAt: now,
        lastModifiedAt: now,
        lastModifiedBy: "María Fernanda Gómez",
        orders: [],
      }
      setData((prev) => [created, ...prev])
      notify({
        variant: "success",
        title: "Cliente registrado exitosamente",
        description: `${created.razonSocial} fue agregado al sistema.`,
      })
    }
    setFormOpen(false)
    setEditing(null)
  }

  const handleInactivate = (c: Client) => {
    const updated: Client = { ...c, estado: "inactive" }
    setData((prev) => prev.map((x) => (x.id === c.id ? updated : x)))
    setView((v) => (v.name === "detail" ? { name: "detail", client: updated } : v))
    setInactivateTarget(null)
    notify({
      variant: c.saldo > 0 ? "warning" : "success",
      title: "Cliente inactivado",
      description:
        c.saldo > 0
          ? `${c.razonSocial} quedó inactivo con saldo pendiente en cartera.`
          : `${c.razonSocial} ya no podrá iniciar sesión.`,
    })
  }

  const breadcrumb = view.name === "detail" ? view.client.razonSocial : "Listado"

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Topbar
        root="Clientes"
        breadcrumb={breadcrumb}
        globalSearch={globalSearch}
        onGlobalSearch={setGlobalSearch}
        searchPlaceholder="Buscar cliente por NIT o razón social..."
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {view.name === "list" ? (
          <ClientsTable
            clients={data}
            globalSearch={globalSearch}
            loading={loading}
            onNew={openNew}
            onView={(c) => setView({ name: "detail", client: c })}
            onEdit={openEdit}
            onInactivate={setInactivateTarget}
          />
        ) : (
          <ClientDetail
            client={view.client}
            onBack={() => setView({ name: "list" })}
            onEdit={openEdit}
            onInactivate={setInactivateTarget}
          />
        )}
      </main>

      <ClientForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        editing={editing}
        onSave={handleSave}
      />

      <InactivateDialog
        client={inactivateTarget}
        onClose={() => setInactivateTarget(null)}
        onConfirm={handleInactivate}
      />
    </div>
  )
}
