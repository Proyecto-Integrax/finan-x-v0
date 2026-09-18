"use client"

import { useState } from "react"
import { Sidebar } from "@/components/finanx/sidebar"
import { ClientsModule } from "@/components/finanx/clients-module"
import { ProductsModule } from "@/components/finanx/products-module"
import { ToastProvider } from "@/components/finanx/toast"

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeModule, setActiveModule] = useState("m2")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        active={activeModule}
        onNavigate={setActiveModule}
      />

      {activeModule === "m1" ? <ClientsModule /> : <ProductsModule />}
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
