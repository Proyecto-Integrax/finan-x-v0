"use client"

import { useState } from "react"
import { Sidebar } from "@/components/finanx/sidebar"
import { ClientsModule } from "@/components/finanx/clients-module"
import { ProductsModule } from "@/components/finanx/products-module"
import { OrdersModule } from "@/components/finanx/orders-module"
import { InvoicesModule } from "@/components/finanx/invoices-module"
import { ToastProvider } from "@/components/finanx/toast"

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeModule, setActiveModule] = useState("m4")

  const renderModule = () => {
    switch (activeModule) {
      case "m1":
        return <ClientsModule />
      case "m2":
        return <ProductsModule />
      case "m3":
        return <OrdersModule />
      case "m4":
        return <InvoicesModule />
      default:
        return <ProductsModule />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        active={activeModule}
        onNavigate={setActiveModule}
      />

      {renderModule()}
    </div>
  )
}

export default function Page() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}
